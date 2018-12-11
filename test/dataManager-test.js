const chai = require('chai');
const expect = chai.expect;
const DataManager = require('../js/dataManager.js');
const  turingData = require( '../js/data.js');

describe('Manage Data', function () {
  let currentObj;

  beforeEach(function () {

    currentObj = new DataManager();
  });

  it('not undefined', function () {

    expect(currentObj).to.not.be.undefined;
  })

  it('Should be an Object', function () {

    expect(typeof currentObj).to.equal('object');
  });

  it('Should be able to have data', function () {

    expect(currentObj[0].question).to
      .equal(`Scorecard Report" & "Peter Jacobsen Plugged In" are seen on the sports channel devoted to this`);
  });

  it('Should be able to manage data', function () {

    expect(currentObj[0].answer).to.equal(turingData.clues[0].answer);
    expect(currentObj[0].available).to.be.true;
  });
});