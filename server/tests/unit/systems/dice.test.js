const request = require('supertest');
const { d4, d6, d8, d10, d12, d20 } = require('../../../util/systems/dice');

describe('dice d4', () => {

  it('should return a number between 1 and 4 inclusive', () => {
    let foundOne   = false;
    let foundTwo   = false;
    let foundThree = false;  
    let foundFour  = false;
    for (i = 0; i < 16; i++) {  
      let dieRoll = d4();
      if (dieRoll == 1) foundOne = true;
      if (dieRoll == 2) foundTwo = true;
      if (dieRoll == 3) foundThree = true;
      if (dieRoll == 4) foundFour = true;
      expect(dieRoll).toBeGreaterThanOrEqual(1);
      expect(dieRoll).toBeLessThanOrEqual(4);
    }
    expect(foundOne).toBeTruthy();
    expect(foundTwo).toBeTruthy();
    expect(foundThree).toBeTruthy();
    expect(foundFour).toBeTruthy();
  });
});

describe('dice d6', () => {

  it('should return a number between 1 and 6 inclusive', () => {
    let foundOne   = false;
    let foundTwo   = false;
    let foundThree = false;  
    let foundFour  = false;
    let foundFive  = false;
    let foundSix   = false;
    for (i = 0; i < 24; i++) {  
      let dieRoll = d6();
      if (dieRoll == 1) foundOne = true;
      if (dieRoll == 2) foundTwo = true;
      if (dieRoll == 3) foundThree = true;
      if (dieRoll == 4) foundFour = true;
      if (dieRoll == 5) foundFive = true;
      if (dieRoll == 6) foundSix = true;
      expect(dieRoll).toBeGreaterThanOrEqual(1);
      expect(dieRoll).toBeLessThanOrEqual(6);
    }
    expect(foundOne).toBeTruthy();
    expect(foundTwo).toBeTruthy();
    expect(foundThree).toBeTruthy();
    expect(foundFour).toBeTruthy();
    expect(foundFive).toBeTruthy();
    expect(foundSix).toBeTruthy();
  });
});

describe('dice d8', () => {

  it('should return a number between 1 and 8 inclusive', () => {
    let foundOne   = false;
    let foundTwo   = false;
    let foundThree = false;  
    let foundFour  = false;
    let foundFive  = false;
    let foundSix   = false;
    let foundSeven = false;
    let foundEight = false;
    for (i = 0; i < 48; i++) {  
      let dieRoll = d8();
      if (dieRoll == 1) foundOne = true;
      if (dieRoll == 2) foundTwo = true;
      if (dieRoll == 3) foundThree = true;
      if (dieRoll == 4) foundFour = true;
      if (dieRoll == 5) foundFive = true;
      if (dieRoll == 6) foundSix = true;
      if (dieRoll == 7) foundSeven = true;
      if (dieRoll == 8) foundEight = true;
      expect(dieRoll).toBeGreaterThanOrEqual(1);
      expect(dieRoll).toBeLessThanOrEqual(8);
    }
    expect(foundOne).toBeTruthy();
    expect(foundTwo).toBeTruthy();
    expect(foundThree).toBeTruthy();
    expect(foundFour).toBeTruthy();
    expect(foundFive).toBeTruthy();
    expect(foundSix).toBeTruthy();
    expect(foundSeven).toBeTruthy();
    expect(foundEight).toBeTruthy();
  });
});

describe('dice d10', () => {

  it('should return a number between 1 and 10 inclusive', () => {
    let foundOne   = false;
    let foundTwo   = false;
    let foundThree = false;  
    let foundFour  = false;
    let foundFive  = false;
    let foundSix   = false;
    let foundSeven = false;
    let foundEight = false;
    let foundNine  = false;
    let foundTen   = false;
    for (i = 0; i < 40; i++) {  
    let dieRoll = d10();
    if (dieRoll == 1) foundOne = true;
    if (dieRoll == 2) foundTwo = true;
    if (dieRoll == 3) foundThree = true;
    if (dieRoll == 4) foundFour = true;
    if (dieRoll == 5) foundFive = true;
    if (dieRoll == 6) foundSix = true;
    if (dieRoll == 7) foundSeven = true;
    if (dieRoll == 8) foundEight = true;
    if (dieRoll == 9) foundNine = true;
    if (dieRoll == 10) foundTen = true;
    expect(dieRoll).toBeGreaterThanOrEqual(1);
    expect(dieRoll).toBeLessThanOrEqual(10);
    }
    expect(foundOne).toBeTruthy();
    expect(foundTwo).toBeTruthy();
    expect(foundThree).toBeTruthy();
    expect(foundFour).toBeTruthy();
    expect(foundFive).toBeTruthy();
    expect(foundSix).toBeTruthy();
    expect(foundSeven).toBeTruthy();
    expect(foundEight).toBeTruthy();
    expect(foundNine).toBeTruthy();
    expect(foundTen).toBeTruthy();
  });
});


describe('dice d12', () => {

  it('should return a number between 1 and 12 inclusive', () => {
    let foundOne   = false;
    let foundTwo   = false;
    let foundThree = false;  
    let foundFour  = false;
    let foundFive  = false;
    let foundSix   = false;
    let foundSeven = false;
    let foundEight = false;
    let foundNine  = false;
    let foundTen   = false;
    let foundEleven = false;
    let foundTwelve = false;
    for (i = 0; i < 48; i++) {  
      let dieRoll = d12();
      if (dieRoll == 1) foundOne = true;
      if (dieRoll == 2) foundTwo = true;
      if (dieRoll == 3) foundThree = true;
      if (dieRoll == 4) foundFour = true;
      if (dieRoll == 5) foundFive = true;
      if (dieRoll == 6) foundSix = true;
      if (dieRoll == 7) foundSeven = true;
      if (dieRoll == 8) foundEight = true;
      if (dieRoll == 9) foundNine = true;
      if (dieRoll == 10) foundTen = true;
      if (dieRoll == 11) foundEleven = true;
      if (dieRoll == 12) foundTwelve = true;
      expect(dieRoll).toBeGreaterThanOrEqual(1);
      expect(dieRoll).toBeLessThanOrEqual(12);
    }
    expect(foundOne).toBeTruthy();
    expect(foundTwo).toBeTruthy();
    expect(foundThree).toBeTruthy();
    expect(foundFour).toBeTruthy();
    expect(foundFive).toBeTruthy();
    expect(foundSix).toBeTruthy();
    expect(foundSeven).toBeTruthy();
    expect(foundEight).toBeTruthy();
    expect(foundNine).toBeTruthy();
    expect(foundTen).toBeTruthy();
    expect(foundEleven).toBeTruthy();
    expect(foundTwelve).toBeTruthy();
  });
});

describe('dice d20', () => {

  it('should return a number between 1 and 20 inclusive', () => {
    let foundOne   = false;
    let foundTwo   = false;
    let foundThree = false;  
    let foundFour  = false;
    let foundFive  = false;
    let foundSix   = false;
    let foundSeven = false;
    let foundEight = false;
    let foundNine  = false;
    let foundTen   = false;
    let foundEleven = false;
    let foundTwelve = false;
    let found13   = false;
    let found14   = false;
    let found15 = false;  
    let found16  = false;
    let found17  = false;
    let found18   = false;
    let found19 = false;
    let found20 = false;
    for (i = 0; i < 80; i++) {  
      let dieRoll = d20();
      if (dieRoll == 1) foundOne = true;
      if (dieRoll == 2) foundTwo = true;
      if (dieRoll == 3) foundThree = true;
      if (dieRoll == 4) foundFour = true;
      if (dieRoll == 5) foundFive = true;
      if (dieRoll == 6) foundSix = true;
      if (dieRoll == 7) foundSeven = true;
      if (dieRoll == 8) foundEight = true;
      if (dieRoll == 9) foundNine = true;
      if (dieRoll == 10) foundTen = true;
      if (dieRoll == 11) foundEleven = true;
      if (dieRoll == 12) foundTwelve = true;
      if (dieRoll == 13) found13 = true;
      if (dieRoll == 14) found14 = true;
      if (dieRoll == 15) found15 = true;
      if (dieRoll == 16) found16 = true;
      if (dieRoll == 17) found17 = true;
      if (dieRoll == 18) found18 = true;
      if (dieRoll == 19) found19 = true;
      if (dieRoll == 20) found20 = true;
      expect(dieRoll).toBeGreaterThanOrEqual(1);
      expect(dieRoll).toBeLessThanOrEqual(20);
    }
    expect(foundOne).toBeTruthy();
    expect(foundTwo).toBeTruthy();
    expect(foundThree).toBeTruthy();
    expect(foundFour).toBeTruthy();
    expect(foundFive).toBeTruthy();
    expect(foundSix).toBeTruthy();
    expect(foundSeven).toBeTruthy();
    expect(foundEight).toBeTruthy();
    expect(foundNine).toBeTruthy();
    expect(foundTen).toBeTruthy();
    expect(foundEleven).toBeTruthy();
    expect(foundTwelve).toBeTruthy();
    expect(found13).toBeTruthy();
    expect(found14).toBeTruthy();
    expect(found15).toBeTruthy();
    expect(found16).toBeTruthy();
    expect(found17).toBeTruthy();
    expect(found18).toBeTruthy();
    expect(found19).toBeTruthy();
    expect(found20).toBeTruthy();
  });
});
  