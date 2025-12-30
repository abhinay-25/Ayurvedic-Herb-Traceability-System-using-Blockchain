import { expect } from "chai";
import { ethers } from "hardhat";

describe("HerbTraceability", function () {
  let herbTraceability;
  let farmer, distributor, manufacturer;

  beforeEach(async function () {
    [farmer, distributor, manufacturer] = await ethers.getSigners();
    
    const HerbTraceability = await ethers.getContractFactory("HerbTraceability");
    herbTraceability = await HerbTraceability.deploy();
    await herbTraceability.waitForDeployment();
  });

  it("Should create a new batch", async function () {
    const herbName = "Tulsi";
    const location = "Madhya Pradesh, India";
    const harvestDate = 1695500000; // Unix timestamp
    const quantity = 100;

    const tx = await herbTraceability.connect(farmer).createBatch(
      herbName,
      location,
      harvestDate,
      quantity
    );
    await tx.wait();

    const batch = await herbTraceability.getBatch(0);
    expect(batch.herbName).to.equal(herbName);
    expect(batch.initialLocation).to.equal(location);
    expect(batch.harvestDate).to.equal(harvestDate);
    expect(batch.quantity).to.equal(quantity);
    expect(batch.farmer).to.equal(farmer.address);
    expect(batch.updateCount).to.equal(1); // Initial collection update
  });

  it("Should add updates to a batch", async function () {
    // Create a batch first
    await herbTraceability.connect(farmer).createBatch(
      "Ashwagandha",
      "Rajasthan, India",
      1695500000,
      50
    );

    // Add distributor update
    await herbTraceability.connect(distributor).addUpdate(
      0,
      "Distributor",
      "Received and packaged for transport",
      "Delhi Warehouse"
    );

    // Add manufacturer update
    await herbTraceability.connect(manufacturer).addUpdate(
      0,
      "Manufacturer",
      "Processed into powder form",
      "Mumbai Processing Plant"
    );

    const batch = await herbTraceability.getBatch(0);
    expect(batch.updateCount).to.equal(3); // Initial + 2 updates

    // Check individual updates
    const firstUpdate = await herbTraceability.getUpdate(0, 0);
    expect(firstUpdate.role).to.equal("Farmer");
    expect(firstUpdate.details).to.equal("Initial Collection");

    const secondUpdate = await herbTraceability.getUpdate(0, 1);
    expect(secondUpdate.role).to.equal("Distributor");
    expect(secondUpdate.details).to.equal("Received and packaged for transport");

    const thirdUpdate = await herbTraceability.getUpdate(0, 2);
    expect(thirdUpdate.role).to.equal("Manufacturer");
    expect(thirdUpdate.details).to.equal("Processed into powder form");
  });

  it("Should emit events when creating batches and adding updates", async function () {
    await expect(
      herbTraceability.connect(farmer).createBatch("Neem", "Karnataka, India", 1695500000, 75)
    ).to.emit(herbTraceability, "BatchCreated")
     .withArgs(0, "Neem", farmer.address);

    await expect(
      herbTraceability.connect(distributor).addUpdate(0, "Distributor", "Quality checked", "Bangalore")
    ).to.emit(herbTraceability, "UpdateAdded")
     .withArgs(0, "Distributor", "Quality checked");
  });

  it("Should revert when trying to access non-existent batch", async function () {
    await expect(herbTraceability.getBatch(999)).to.be.revertedWith("Batch does not exist");
    await expect(herbTraceability.getUpdate(999, 0)).to.be.revertedWith("Batch does not exist");
  });

  it("Should revert when trying to access invalid update index", async function () {
    await herbTraceability.connect(farmer).createBatch("Turmeric", "Kerala, India", 1695500000, 200);
    
    await expect(herbTraceability.getUpdate(0, 999)).to.be.revertedWith("Invalid update index");
  });
});