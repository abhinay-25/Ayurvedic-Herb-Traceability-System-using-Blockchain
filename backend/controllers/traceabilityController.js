const express = require('express');
const router = express.Router();
const Herb = require('../models/Herb');
const Farmer = require('../models/Farmer');
const asyncHandler = require('express-async-handler');

// @desc    Get comprehensive traceability data
// @route   GET /api/traceability
// @access  Public
const getTraceabilityOverview = asyncHandler(async (req, res) => {
  try {
    const [
      totalHerbs,
      totalFarmers,
      herbsByStatus,
      recentActivities,
      locationStats,
      qualityStats
    ] = await Promise.all([
      Herb.countDocuments({}),
      Farmer.countDocuments({ verificationStatus: 'Verified' }),
      Herb.aggregate([
        {
          $group: {
            _id: '$currentStatus',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Herb.find({})
        .populate('collector', 'name farmerId address.city address.state')
        .sort({ updatedAt: -1 })
        .limit(20)
        .select('herbId name currentStatus collector harvestDate updatedAt'),
      Herb.aggregate([
        {
          $group: {
            _id: '$geoTag.state',
            count: { $sum: 1 },
            uniqueCollectors: { $addToSet: '$collector' }
          }
        },
        {
          $addFields: {
            farmersCount: { $size: '$uniqueCollectors' }
          }
        },
        { $project: { uniqueCollectors: 0 } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Herb.aggregate([
        {
          $group: {
            _id: '$quality',
            count: { $sum: 1 },
            avgQuantity: { $avg: '$quantity' }
          }
        },
        { $sort: { count: -1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalHerbs,
          totalFarmers,
          totalTransactions: totalHerbs, // Each herb represents a transaction
          activeSupplyChains: herbsByStatus.length
        },
        distribution: {
          byStatus: herbsByStatus,
          byLocation: locationStats,
          byQuality: qualityStats
        },
        recentActivities,
        timestamp: new Date()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Track specific herb journey
// @route   GET /api/traceability/herb/:herbId
// @access  Public
const getHerbJourney = asyncHandler(async (req, res) => {
  try {
    const herb = await Herb.findOne({ herbId: req.params.herbId })
      .populate('collector', 'name farmerId address location farmDetails');

    if (!herb) {
      return res.status(404).json({
        success: false,
        error: 'Herb not found'
      });
    }

    // Get farmer details
    let farmer = null;
    if (herb.collector) {
      farmer = await Farmer.findOne({ farmerId: herb.collector });
    }

    // Build journey timeline
    const timeline = [
      {
        stage: 'Farm Registration',
        date: farmer?.registrationDate || herb.harvestDate,
        location: farmer?.fullAddress || `${herb.geoTag?.latitude}, ${herb.geoTag?.longitude}`,
        actor: farmer?.name || herb.collector,
        details: {
          farmType: farmer?.farmDetails?.farmType,
          farmSize: farmer?.farmDetails?.farmSize,
          certifications: farmer?.certifications?.length || 0
        }
      },
      {
        stage: 'Harvest',
        date: herb.harvestDate,
        location: `${herb.geoTag.latitude}, ${herb.geoTag.longitude}`,
        actor: farmer?.name || herb.collector,
        details: {
          quantity: `${herb.quantity} ${herb.unit}`,
          quality: herb.quality,
          harvestMethod: herb.harvestMethod || 'Manual'
        }
      }
    ];

    // Add status updates to timeline
    if (herb.statusHistory && herb.statusHistory.length > 0) {
      herb.statusHistory.forEach(status => {
        timeline.push({
          stage: status.status,
          date: status.timestamp,
          location: status.location || 'Not specified',
          actor: status.updatedBy || 'System',
          details: {
            notes: status.notes,
            previousStatus: status.previousStatus
          }
        });
      });
    }

    // Sort timeline by date
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Calculate journey metrics
    const journeyDuration = herb.statusHistory?.length > 0 
      ? Math.ceil((new Date() - new Date(herb.harvestDate)) / (1000 * 60 * 60 * 24))
      : Math.ceil((new Date() - new Date(herb.harvestDate)) / (1000 * 60 * 60 * 24));

    const totalStages = timeline.length;
    const completionPercentage = herb.currentStatus === 'Delivered' ? 100 : 
      Math.round((timeline.length / 6) * 100); // Assuming 6 total stages

    res.status(200).json({
      success: true,
      data: {
        herb: {
          herbId: herb.herbId,
          name: herb.name,
          currentStatus: herb.currentStatus,
          quality: herb.quality,
          quantity: `${herb.quantity} ${herb.unit}`,
          harvestDate: herb.harvestDate
        },
        farmer: farmer ? {
          farmerId: farmer.farmerId,
          name: farmer.name,
          farmName: farmer.farmDetails?.farmName,
          location: farmer.fullAddress,
          verificationStatus: farmer.verificationStatus,
          specializations: farmer.specializations
        } : null,
        journey: {
          timeline,
          metrics: {
            totalStages,
            journeyDuration: `${journeyDuration} days`,
            completionPercentage: `${completionPercentage}%`
          }
        },
        blockchain: {
          transactionHash: herb.blockchainHash,
          contractAddress: process.env.CONTRACT_ADDRESS,
          network: 'Avalanche Fuji Testnet'
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get supply chain analytics
// @route   GET /api/traceability/analytics
// @access  Public
const getSupplyChainAnalytics = asyncHandler(async (req, res) => {
  const { timeframe = '30d', region } = req.query;
  
  try {
    // Calculate date range
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 365;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Build query for date and region filtering
    const matchQuery = { harvestDate: { $gte: startDate } };
    if (region) {
      matchQuery['geoTag.state'] = new RegExp(region, 'i');
    }

    const [
      productionTrends,
      qualityDistribution,
      farmerParticipation,
      statusProgression,
      geographicalDistribution
    ] = await Promise.all([
      // Production trends over time
      Herb.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$harvestDate" }
            },
            count: { $sum: 1 },
            totalQuantity: { $sum: "$quantity" }
          }
        },
        { $sort: { "_id": 1 } }
      ]),
      
      // Quality distribution
      Herb.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$quality",
            count: { $sum: 1 },
            avgQuantity: { $avg: "$quantity" }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Farmer participation
      Herb.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$collector",
            herbCount: { $sum: 1 },
            totalQuantity: { $sum: "$quantity" },
            qualityGrades: { $addToSet: "$quality" }
          }
        },
        { $sort: { herbCount: -1 } },
        { $limit: 10 }
      ]),
      
      // Status progression analysis
      Herb.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$currentStatus",
            count: { $sum: 1 },
            avgDaysFromHarvest: {
              $avg: {
                $divide: [
                  { $subtract: [new Date(), "$harvestDate"] },
                  1000 * 60 * 60 * 24
                ]
              }
            }
          }
        },
        { $sort: { count: -1 } }
      ]),
      
      // Geographical distribution
      Herb.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              state: "$geoTag.state",
              district: "$geoTag.district"
            },
            count: { $sum: 1 },
            totalQuantity: { $sum: "$quantity" },
            avgQuality: { $avg: { $cond: [{ $eq: ["$quality", "A"] }, 4, { $cond: [{ $eq: ["$quality", "B"] }, 3, { $cond: [{ $eq: ["$quality", "C"] }, 2, 1] }] }] } },
            uniqueFarmers: { $addToSet: "$collector" }
          }
        },
        {
          $addFields: {
            farmerCount: { $size: "$uniqueFarmers" }
          }
        },
        { $project: { uniqueFarmers: 0 } },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        timeframe,
        region: region || 'All Regions',
        analytics: {
          productionTrends,
          qualityDistribution,
          topFarmers: farmerParticipation,
          statusProgression,
          geographicalDistribution
        },
        summary: {
          totalHerbs: productionTrends.reduce((sum, day) => sum + day.count, 0),
          totalQuantity: productionTrends.reduce((sum, day) => sum + day.totalQuantity, 0),
          avgDailyProduction: productionTrends.length > 0 
            ? Math.round(productionTrends.reduce((sum, day) => sum + day.count, 0) / productionTrends.length)
            : 0,
          activeRegions: geographicalDistribution.length
        },
        generatedAt: new Date()
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Verify authenticity of herb
// @route   GET /api/traceability/verify/:herbId
// @access  Public
const verifyAuthenticity = asyncHandler(async (req, res) => {
  try {
    const herb = await Herb.findOne({ herbId: req.params.herbId });
    
    if (!herb) {
      return res.status(404).json({
        success: false,
        error: 'Herb not found',
        authentic: false
      });
    }

    // Verify farmer exists and is verified
    const farmer = await Farmer.findOne({ farmerId: herb.collector });
    const farmerVerified = farmer && farmer.verificationStatus === 'Verified';
    
    // Check blockchain hash exists
    const blockchainVerified = !!herb.blockchainHash;
    
    // Check data consistency
    const dataConsistent = herb.herbId && herb.name && herb.harvestDate && herb.geoTag;
    
    // Calculate authenticity score
    let authenticityScore = 0;
    if (farmerVerified) authenticityScore += 40;
    if (blockchainVerified) authenticityScore += 30;
    if (dataConsistent) authenticityScore += 20;
    if (herb.quality && ['A', 'B', 'C'].includes(herb.quality)) authenticityScore += 10;

    const isAuthentic = authenticityScore >= 70;
    
    res.status(200).json({
      success: true,
      data: {
        herbId: herb.herbId,
        authentic: isAuthentic,
        authenticityScore: `${authenticityScore}/100`,
        verification: {
          farmerVerified,
          blockchainVerified,
          dataConsistent,
          qualityGraded: !!herb.quality
        },
        details: {
          farmer: farmer ? {
            name: farmer.name,
            farmerId: farmer.farmerId,
            verificationStatus: farmer.verificationStatus
          } : null,
          blockchain: {
            hash: herb.blockchainHash,
            network: 'Avalanche Fuji Testnet'
          },
          harvestInfo: {
            date: herb.harvestDate,
            location: `${herb.geoTag.latitude}, ${herb.geoTag.longitude}`,
            quality: herb.quality
          }
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// @desc    Get supply chain alerts
// @route   GET /api/traceability/alerts
// @access  Public
const getSupplyChainAlerts = asyncHandler(async (req, res) => {
  try {
    const alerts = [];
    const currentDate = new Date();
    
    // Check for herbs stuck in processing for too long
    const stuckHerbs = await Herb.find({
      currentStatus: { $in: ['Processing', 'In Transit'] },
      updatedAt: { $lt: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000) } // 7 days ago
    }).populate('collector', 'name farmerId');
    
    stuckHerbs.forEach(herb => {
      alerts.push({
        type: 'warning',
        severity: 'medium',
        herbId: herb.herbId,
        message: `Herb stuck in ${herb.currentStatus} status for over 7 days`,
        farmer: herb.collector?.name,
        date: herb.updatedAt
      });
    });
    
    // Check for quality issues
    const qualityIssues = await Herb.find({
      quality: { $in: ['D', 'F'] },
      createdAt: { $gte: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000) }
    }).populate('collector', 'name farmerId');
    
    qualityIssues.forEach(herb => {
      alerts.push({
        type: 'error',
        severity: 'high',
        herbId: herb.herbId,
        message: `Poor quality grade: ${herb.quality}`,
        farmer: herb.collector?.name,
        date: herb.createdAt
      });
    });
    
    // Check for unverified farmers with recent harvests
    const unverifiedFarmers = await Farmer.find({
      verificationStatus: { $in: ['Pending', 'Rejected'] }
    });
    
    for (const farmer of unverifiedFarmers) {
      const recentHerbs = await Herb.countDocuments({
        collector: farmer.farmerId,
        createdAt: { $gte: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000) }
      });
      
      if (recentHerbs > 0) {
        alerts.push({
          type: 'warning',
          severity: 'medium',
          farmerId: farmer.farmerId,
          message: `Unverified farmer has ${recentHerbs} recent harvest(s)`,
          farmer: farmer.name,
          date: farmer.createdAt
        });
      }
    }
    
    // Sort alerts by severity and date
    const severityOrder = { high: 3, medium: 2, low: 1 };
    alerts.sort((a, b) => {
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.date) - new Date(a.date);
    });
    
    res.status(200).json({
      success: true,
      data: {
        alertCount: alerts.length,
        alerts: alerts.slice(0, 50), // Limit to 50 most important alerts
        summary: {
          high: alerts.filter(a => a.severity === 'high').length,
          medium: alerts.filter(a => a.severity === 'medium').length,
          low: alerts.filter(a => a.severity === 'low').length
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = {
  getTraceabilityOverview,
  getHerbJourney,
  getSupplyChainAnalytics,
  verifyAuthenticity,
  getSupplyChainAlerts
};