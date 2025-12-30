// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract HerbTraceability {
    struct Herb {
        string herbId;
        string name;
        string collector;
        string geoTag;     // stored as "lat,long"
        string status;
        uint256 timestamp;
    }

    // Mapping from herbId to array of Herb structs (full history)
    mapping(string => Herb[]) public herbHistory;
    
    // Mapping to check if herbId exists
    mapping(string => bool) public herbExists;
    
    // Array to keep track of all herbIds for enumeration
    string[] public allHerbIds;

    // Events
    event HerbAdded(string indexed herbId, string name, string collector, uint256 timestamp);
    event StatusUpdated(string indexed herbId, string newStatus, uint256 timestamp);

    // Add initial herb entry
    function addHerb(
        string memory herbId,
        string memory name,
        string memory collector,
        string memory geoTag,
        string memory status
    ) external {
        require(bytes(herbId).length > 0, "Herb ID cannot be empty");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(collector).length > 0, "Collector cannot be empty");
        require(bytes(geoTag).length > 0, "GeoTag cannot be empty");
        require(bytes(status).length > 0, "Status cannot be empty");
        
        // Check if herb doesn't already exist
        require(!herbExists[herbId], "Herb with this ID already exists");

        // Create new herb entry
        Herb memory newHerb = Herb({
            herbId: herbId,
            name: name,
            collector: collector,
            geoTag: geoTag,
            status: status,
            timestamp: block.timestamp
        });

        // Add to history
        herbHistory[herbId].push(newHerb);
        
        // Mark as existing
        herbExists[herbId] = true;
        
        // Add to list of all herb IDs
        allHerbIds.push(herbId);

        emit HerbAdded(herbId, name, collector, block.timestamp);
    }

    // Update herb status (appends new entry to history)
    function updateStatus(
        string memory herbId,
        string memory newStatus
    ) external {
        require(herbExists[herbId], "Herb does not exist");
        require(bytes(newStatus).length > 0, "Status cannot be empty");

        // Get the latest herb entry to copy data
        Herb[] storage history = herbHistory[herbId];
        require(history.length > 0, "No herb history found");
        
        Herb memory latestHerb = history[history.length - 1];

        // Create new entry with updated status
        Herb memory updatedHerb = Herb({
            herbId: herbId,
            name: latestHerb.name,
            collector: latestHerb.collector,
            geoTag: latestHerb.geoTag,
            status: newStatus,
            timestamp: block.timestamp
        });

        // Add to history
        history.push(updatedHerb);

        emit StatusUpdated(herbId, newStatus, block.timestamp);
    }

    // Get full traceability history for a herb
    function getHerbHistory(string memory herbId) 
        public 
        view 
        returns (Herb[] memory) 
    {
        require(herbExists[herbId], "Herb does not exist");
        return herbHistory[herbId];
    }

    // Get latest status of a herb
    function getLatestStatus(string memory herbId) 
        public 
        view 
        returns (Herb memory) 
    {
        require(herbExists[herbId], "Herb does not exist");
        Herb[] memory history = herbHistory[herbId];
        require(history.length > 0, "No herb history found");
        return history[history.length - 1];
    }

    // Get count of history entries for a herb
    function getHistoryCount(string memory herbId) 
        public 
        view 
        returns (uint256) 
    {
        require(herbExists[herbId], "Herb does not exist");
        return herbHistory[herbId].length;
    }

    // Get total number of herbs tracked
    function getTotalHerbs() public view returns (uint256) {
        return allHerbIds.length;
    }

    // Get all herb IDs (for enumeration)
    function getAllHerbIds() public view returns (string[] memory) {
        return allHerbIds;
    }

    // Get herb at specific history index
    function getHerbAtIndex(string memory herbId, uint256 index) 
        public 
        view 
        returns (Herb memory) 
    {
        require(herbExists[herbId], "Herb does not exist");
        require(index < herbHistory[herbId].length, "Index out of bounds");
        return herbHistory[herbId][index];
    }

    // Validate herb status (helper function for frontend/backend)
    function isValidStatus(string memory status) 
        public 
        pure 
        returns (bool) 
    {
        return (
            keccak256(abi.encodePacked(status)) == keccak256(abi.encodePacked("Collected")) ||
            keccak256(abi.encodePacked(status)) == keccak256(abi.encodePacked("Processing")) ||
            keccak256(abi.encodePacked(status)) == keccak256(abi.encodePacked("Packaged")) ||
            keccak256(abi.encodePacked(status)) == keccak256(abi.encodePacked("Final Formulation"))
        );
    }
}