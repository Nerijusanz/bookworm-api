import seeder from "mongoose-seed";
import dotenv from "dotenv";
import data from "./data.json";

dotenv.config();

seeder.connect(
  process.env.MONGODB_URL,
  { useNewUrlParser: true },
  () => {
    seeder.loadModels([
      "models/Background",
      "models/Race",
      "models/Characters"
    ]);

    seeder.clearModels(["Background", "Race", "Characters"], () => {
      seeder.populateModels(data, () => {
        seeder.disconnect();
      });
    });
  }
);
