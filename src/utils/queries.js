// verify machine models definition
const modelNames = db.models
  .find()
  .toArray()
  .map(m => m.name);

db.machines.find().forEach(m => {
  if (!modelNames.includes(m.model)) {
    print(`Model ${m.model} not defined for machine ${m._id}`);
  }
});
