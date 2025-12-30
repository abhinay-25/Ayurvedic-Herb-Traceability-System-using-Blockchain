// @desc    Get herb traceability history/journey
// @route   GET /api/herbs/:id/history
// @access  Public
const getHerbHistory = async (req, res) => {
  try {
    const herbId = req.params.id;
    const Herb = require('../models/Herb');
    const blockchainService = require('../services/blockchainService');

    // Get herb from MongoDB
    const herb = await Herb.findOne({ herbId });

    if (!herb) {
      return res.status(404).json({
        success: false,
        error: `Herb not found with ID: ${herbId}`
      });
    }

    let journey = [];
    let blockchainData = null;

    // Fetch blockchain history if available
    if (herb.batchId !== null && blockchainService.isInitialized()) {
      try {
        // Get herb history from blockchain
        const historyData = await blockchainService.getHerbHistoryFromBlockchain(herbId);
        
        if (historyData && historyData.length > 0) {
          // Format blockchain data for journey
          journey = historyData.map((entry, index) => ({
            id: index + 1,
            status: entry.status || 'Unknown',
            geoTag: entry.geoTag || '',
            timestamp: entry.timestamp ? parseInt(entry.timestamp.toString()) : Date.now(),
            txHash: entry.txHash || '',
            location: entry.location || '',
            description: entry.description || '',
            updatedBy: entry.updatedBy || '',
            stage: getStageFromStatus(entry.status || 'Unknown')
          }));
        }

        // Also get batch updates if available
        if (herb.batchId) {
          try {
            const batchUpdates = await blockchainService.getAllBatchUpdates(herb.batchId);
            blockchainData = batchUpdates;
          } catch (error) {
            console.warn('⚠️ Could not fetch batch updates:', error.message);
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch herb history from blockchain:', error.message);
      }
    }

    // If no blockchain journey, create from MongoDB data
    if (journey.length === 0) {
      journey = [
        {
          id: 1,
          status: herb.status || 'Collected',
          geoTag: herb.geoTag || '',
          timestamp: herb.harvestDate ? new Date(herb.harvestDate).getTime() / 1000 : Date.now() / 1000,
          txHash: '',
          location: herb.location || '',
          description: `Herb ${herb.name} collected by ${herb.collector}`,
          updatedBy: herb.collector || '',
          stage: getStageFromStatus(herb.status || 'Collected')
        }
      ];
    }

    // Sort journey by timestamp
    journey.sort((a, b) => a.timestamp - b.timestamp);

    // Add stage progression
    journey = journey.map((step, index) => ({
      ...step,
      stepNumber: index + 1,
      isCurrentStep: index === journey.length - 1,
      isCompleted: index < journey.length - 1
    }));

    res.status(200).json({
      success: true,
      data: {
        herbId,
        name: herb.name,
        scientificName: herb.scientificName || '',
        collector: herb.collector,
        harvestDate: herb.harvestDate,
        currentStatus: herb.status,
        totalSteps: journey.length,
        journey,
        blockchain: blockchainData,
        metadata: {
          batchId: herb.batchId,
          quality: herb.quality,
          quantity: herb.quantity,
          unit: herb.unit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching herb history:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching herb history'
    });
  }
};

// Helper function to determine stage from status
function getStageFromStatus(status) {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('collect') || statusLower.includes('harvest')) {
    return {
      name: 'Collected',
      icon: '🌱',
      color: 'green',
      description: 'Herb collected from natural habitat'
    };
  } else if (statusLower.includes('process') || statusLower.includes('clean') || statusLower.includes('dry')) {
    return {
      name: 'Processing',
      icon: '⚙️',
      color: 'blue',
      description: 'Herb being processed and prepared'
    };
  } else if (statusLower.includes('pack') || statusLower.includes('store')) {
    return {
      name: 'Packaged',
      icon: '📦',
      color: 'orange',
      description: 'Herb packaged for distribution'
    };
  } else if (statusLower.includes('formul') || statusLower.includes('final') || statusLower.includes('complet')) {
    return {
      name: 'Final Formulation',
      icon: '🧪',
      color: 'purple',
      description: 'Herb formulated into final product'
    };
  } else if (statusLower.includes('ship') || statusLower.includes('transport')) {
    return {
      name: 'In Transit',
      icon: '🚚',
      color: 'yellow',
      description: 'Herb in transportation'
    };
  } else if (statusLower.includes('deliver') || statusLower.includes('receiv')) {
    return {
      name: 'Delivered',
      icon: '✅',
      color: 'green',
      description: 'Herb delivered to destination'
    };
  } else {
    return {
      name: status,
      icon: '📍',
      color: 'gray',
      description: `Status: ${status}`
    };
  }
}

module.exports = { getHerbHistory };