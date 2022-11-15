
const { getTrips, getDriver } = require("api");
/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
  const tripList = await getTrips()
  const driverList = {}

  await Promise.allSettled(tripList.map(e => getDriver(e.driverID).then(result =>
    driverList[e.driverID] = result
  )))

  const allDrivers = {}
  let tempAmount = 0
  let maxAmount = 0
  let minTripNo = 0
  let maxTripNo = 0
  let keys = []
  for (let trip of tripList) { keys.push(trip.driverID) }
  keys = [...new Set(keys)]

  
  for (const id in keys) {
    for (const details in driverList) {
      if (keys[id] === details) allDrivers[keys[id]] = driverList[details]
    }
  }
  const obj = {
    noOfCashTrips: 0,
    noOfNonCashTrips: 0,
    billedTotal: 0,
    cashBilledTotal: 0,
    nonCashBilledTotal: 0,
    noOfDriversWithMoreThanOneVehicle: 0,
    mostTripsByDriver: {
      name: '',
      email: '',
      phone: '',
      noOfTrips: 0,
      totalAmountEarned: 0
    },
    highestEarningDriver: {
      name: '',
      email: '',
      phone: '',
      noOfTrips: 0,
      totalAmountEarned: 0
    }
  }
  for (let i = 0; i < tripList.length; i++) {
    if (tripList[i].isCash === true) {
      obj.noOfCashTrips++
      const bill = Number(tripList[i].billedAmount) || Number(tripList[i].billedAmount.replace(',', ''))
      obj.billedTotal += bill
      obj.cashBilledTotal += bill
    }
    if (tripList[i].isCash === false) {
      obj.noOfNonCashTrips++
      const bill = Number(tripList[i].billedAmount) || Number(tripList[i].billedAmount.replace(',', ''))
      obj.billedTotal += bill
      obj.nonCashBilledTotal += bill
    }
  }

  for (const key in allDrivers) {
    if (allDrivers[key].vehicleID.length > 1) {
      obj.noOfDriversWithMoreThanOneVehicle++
    }
    for (let i = 0; i < tripList.length; i++) {
      if (tripList[i].driverID === key) {
        tempAmount += Number(tripList[i].billedAmount) || Number(tripList[i].billedAmount.replace(',', ''))
        minTripNo++
      }
      if (minTripNo > maxTripNo) {
        maxTripNo = minTripNo
        obj.mostTripsByDriver.name = allDrivers[key].name
        obj.mostTripsByDriver.email = allDrivers[key].email
        obj.mostTripsByDriver.phone = allDrivers[key].phone
        obj.mostTripsByDriver.noOfTrips = maxTripNo
        obj.mostTripsByDriver.totalAmountEarned = tempAmount
      }
      if (tempAmount > maxAmount) {
        maxAmount = tempAmount
        obj.highestEarningDriver.name = allDrivers[key].name
        obj.highestEarningDriver.email = allDrivers[key].email
        obj.highestEarningDriver.phone = allDrivers[key].phone
        obj.highestEarningDriver.noOfTrips = minTripNo
        obj.highestEarningDriver.totalAmountEarned = maxAmount
      }
    }
    tempAmount = 0
    minTripNo = 0
  }

  obj.nonCashBilledTotal = Number(obj.nonCashBilledTotal.toFixed(2))
  obj.billedTotal = Number(obj.billedTotal.toFixed(2))

  return obj
}

module.exports = analysis;

