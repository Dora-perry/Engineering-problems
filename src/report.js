const { getTrips, getDriver, getVehicle } = require("api");
/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */
async function driverReport() {
  const allTrips = await getTrips();
  const driverList = {};
  await Promise.allSettled(
    allTrips.map((e) =>
      getDriver(e.driverID)
        .then((result) => (driverList[e.driverID] = result))
        .then(() => (driverList[e.driverID]["vehicle"] = []))
    )
  );
  for (const key in driverList) {
    if (driverList[key].vehicleID.length > 1) {
      for (let n = 0; n < driverList[key].vehicleID.length; n++) {
        const vehicle = await getVehicle(driverList[key].vehicleID[n]);
        driverList[key]["vehicle"].push(vehicle);
      }
    } else {
      const vehicle = await getVehicle(driverList[key].vehicleID);
      driverList[key]["vehicle"].push(vehicle);
    }
  }
  allDrivers = {};
  let keys = [];
  allTrips.forEach((trip) => {
    keys.push(trip.driverID);
  });
  keys = [...new Set(keys)];
  for (const id of keys) {
    if (id in driverList) allDrivers[id] = driverList[id];
  }
  const output = [];
  let personObj = {
    fullname: "",
    phone: "",
    id: "",
    vehicles: [],
    noOfTrips: 0,
    noOfCashTrips: 0,
    noOfNonCashTrips: 0,
    trips: [],
    totalAmountEarned: 0,
    totalCashAmount: 0,
    totalNonCashAmount: 0,
  };
  let personVehicle = {
    plate: "",
    manufacturer: "",
  };
  let personTrip = {
    user: "",
    created: "",
    pickup: "",
    destination: "",
    billed: 0,
    isCash: false,
  };
  // Deep copy of each object structure for reuse
  const copyOfPersonObj = JSON.parse(JSON.stringify(personObj));
  const copyOfPersonVehicle = JSON.parse(JSON.stringify(personVehicle));
  const copyOfPersonTrip = JSON.parse(JSON.stringify(personTrip));
  // Looping through each driver in the outer loop while collecting trip and personal details
  for (const id in allDrivers) {
    for (let trip of allTrips) {
      if (id === trip.driverID) {
        personObj.totalAmountEarned +=
          Number(trip.billedAmount) ||
          Number(trip.billedAmount.replace(",", ""));
        personObj.noOfTrips++;
        personObj.id = id;
        personObj.fullname = allDrivers[id].name;
        personObj.phone = allDrivers[id].phone;
        if (trip.isCash === true) {
          personObj.totalCashAmount +=
            Number(trip.billedAmount) ||
            Number(trip.billedAmount.replace(",", ""));
          personObj.noOfCashTrips++;
        } else {
          personObj.totalNonCashAmount +=
            Number(trip.billedAmount) ||
            Number(trip.billedAmount.replace(",", ""));
          personObj.noOfNonCashTrips++;
        }
        personTrip.user = trip.user.name;
        personTrip.created = trip.created;
        personTrip.pickup = trip.pickup.address;
        personTrip.destination = trip.destination.address;
        personTrip.isCash = trip.isCash;
        personTrip.billed =
          Number(trip.billedAmount) ||
          Number(trip.billedAmount.replace(",", ""));
        personObj.trips.push(personTrip);
        personTrip = JSON.parse(JSON.stringify(copyOfPersonTrip));
      }
    }
    personObj.totalAmountEarned = Number(
      personObj.totalAmountEarned.toFixed(2)
    );
    personObj.totalCashAmount = Number(personObj.totalCashAmount.toFixed(2));
    personObj.totalNonCashAmount = Number(
      personObj.totalNonCashAmount.toFixed(2)
    );
    output.push(personObj);
    personObj = JSON.parse(JSON.stringify(copyOfPersonObj));
  }
  // Matching the vehicle details for each driver
  for (let driver of output) {
    const id = driver.id;
    for (const key in allDrivers[id].vehicle) {
      personVehicle.plate = allDrivers[id].vehicle[key].plate;
      personVehicle.manufacturer = allDrivers[id].vehicle[key].manufacturer;
      driver.vehicles.push(personVehicle);
      personVehicle = JSON.parse(JSON.stringify(copyOfPersonVehicle));
    }
  }
  return output;
}
module.exports = driverReport;
driverReport();

