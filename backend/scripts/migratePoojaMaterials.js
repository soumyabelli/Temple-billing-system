require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const Pooja = require("../src/models/Pooja");

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB for migration");
    try {
      const poojas = await Pooja.find({});
      console.log(`Found ${poojas.length} poojas to migrate.`);
      
      let migratedCount = 0;
      
      for (let pooja of poojas) {
        let needsSave = false;
        if (pooja.requiredMaterials && pooja.requiredMaterials.length > 0) {
          for (let mat of pooja.requiredMaterials) {
            // Convert legacy booleans to responsibilityType if not already set or defaulted
            if (mat.mustBringByDevotee === true) {
              mat.responsibilityType = "DEVOTEE_MUST_BRING";
              needsSave = true;
            } else if (mat.canTempleArrange === true && mat.mustBringByDevotee === false) {
              // Usually if temple charge > 0, it means devotees could bring it or temple arranges it
              if (mat.templeCharge > 0) {
                 mat.responsibilityType = "DEVOTEE_OR_TEMPLE";
              } else {
                 mat.responsibilityType = "TEMPLE_PROVIDES";
              }
              needsSave = true;
            } else {
              // Catch all
              if (!mat.responsibilityType) {
                 mat.responsibilityType = "TEMPLE_PROVIDES";
                 needsSave = true;
              }
            }
          }
        }
        
        if (needsSave) {
          // Temporarily disable validation if any old strict fields complain, though we should be safe
          await pooja.save({ validateModifiedOnly: true });
          migratedCount++;
        }
      }
      console.log(`Successfully migrated ${migratedCount} poojas.`);
    } catch (err) {
      console.error("Migration failed:", err);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => {
    console.error("Connection error:", err);
  });
