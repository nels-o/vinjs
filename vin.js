const C = require('./constants');

class VIN {
  static decode(vin) {
    return new VIN(vin);
  }

  constructor(vin) {
    this.vin = vin.toUpperCase();
  }

  country() {
    // Returns the World Manufacturer's Country.
    const countries = C.WORLD_MANUFACTURER_MAP[this.vin[0]].countries;
    for (let codes in countries) {
      if (codes.includes(this.vin[1])) {
        return countries[codes]
      }
    }
    return 'Unknown'
  }

  is_pre_2010() {
    // Returns true if the model year is in the 1980-2009 range
    // In order to identify exact year in passenger cars and multipurpose 
    // passenger vehicles with a GVWR of 10,000 or less, one must read 
    // position 7 as well as position 10. For passenger cars, and for 
    // multipurpose passenger vehicles and trucks with a gross vehicle 
    // weight rating of 10,000 lb (4,500 kg) or less, if position 7 is 
    // numeric, the model year in position 10 of the VIN refers to a year 
    // in the range 1980-2009. If position 7 is alphabetic, the model year 
    // in position 10 of VIN refers to a year in the range 2010-2039.
    return /[0-9]/.exec(this.vin[6]) !== null;
  }

  is_valid() {
    // Returns true if a VIN is valid, otherwise returns false.
    if (this.vin.length != 17) {
      // For model years 1981 to present, the VIN is composed of 17 
      // alphanumeric values
      return false;
    }

    if (this.vin.split('').map((x) => 'IOQ'.includes(x)).reduce((a, b) => a || b)) {
      // The letters I,O, Q are prohibited from any VIN position 
      return false;
    }

    if ('UZ0'.includes(this.vin[9])) {
      // The tenth position of the VIN represents the Model Year and 
      // does not permit the use of the characters U and Z, as well 
      // as the numeric zero (0)
      return false;
    }

    const products = this.vin.split('').map((i, j) => {
      return C.VIN_WEIGHT[j] * C.VIN_TRANSLATION[i];
    });
  
    let check_digit = products.reduce((a, b) => a + b) % 11;
    if (check_digit == 10) {
      check_digit = 'X';
    }

    if (this.vin[8] != check_digit.toString()) {
      // The ninth position of the VIN is a calculated value based on 
      // the other 16 alphanumeric values, it's called the 
      // "Check Digit". The result of the check digit can ONLY be a 
      // numeric 0-9 or letter "X".
      return false;
    }
    return true;
  }

  less_than_500_built_per_year() {
    // A manufacturer who builds fewer than 500 vehicles 
    // per year uses a 9 as the third digit
    try {
      return parseInt(this.vin[2], 10) == 9;
    } catch (e) {
      return false;
    }
  }

  region() {
    // Returns the World Manufacturer's Region. Possible results:
    return C.WORLD_MANUFACTURER_MAP[this.vin[0]].region;
  }

  vis() {
    // Returns the Vehicle Idendifier Sequence (ISO 3779)
    // Model Year, Manufacturer Plant and/or Serial Number
    return this.vin.slice(-8);
  }

  vds() {
    // Returns the Vehicle Descriptor Section (ISO 3779)
    // Assigned by Manufacturer; Check Digit is Calculated
    return this.vin.slice(3, 9);
  }

  vsn() {
    // Returns the Vehicle Sequential Number
    if (this.less_than_500_built_per_year) {
      return this.vin.slice(-3);
    } else {
      return this.vin.slice(-6);
    }
  }

  wmi() {
    // Returns the World Manufacturer Identifier (any standards)
    // Assigned by SAE
    return this.vin.slice(0, 3);
  }

  squish_vin() {
    return this.vin.substr( 0, 8 ) + this.vin.substr( 9, 2 );
  }

  manufacturer() {
    const wmi = this.wmi()
    let t = wmi.slice(0, 3);
    if (C.WMI_MAP[t]) {
      return C.WMI_MAP[t];
    }
    t = wmi.slice(0, 2);
    if (C.WMI_MAP[t]) {
      return C.WMI_MAP[t];
    }
    return 'Unknown';
  }

  make() {
    // This is like manufacturer, but without country or other suffixes, and should be short common name.
    // Should be same as values from e.g. http://www.fueleconomy.gov/ws/rest/vehicle/menu/make?year=2012
    // Should probably have a static table instead of doing late fixup like this.
    let man = this.manufacturer();
    for (let suffix in [
        'Argentina',
        'Canada',
        'Cars',
        'France',
        'Hungary',
        'Mexico',
        'Motor Company',
        'Truck USA',
        'Turkey',
        'USA',
        'USA - trucks',
        'USA (AutoAlliance International)',
      ]) {
      if (man.endsWith(suffix)){
        man = man.replace(` ${suffix}`, '');
      }
    }
    if (man == "General Motors") {
      return "GMC";
    }
    if (man == 'Chrysler') {
      // 2012 and later: first 3 positions became overloaded, some 'make' aka brand info moved further in; see
      // https://en.wikibooks.org/wiki/Vehicle_Identification_Numbers_(VIN_codes)/Chrysler/VIN_Codes
      // http://www.allpar.com/mopar/vin-decoder.html
      if (this.year > 2011) {
        brandcode = this.vin[4]
        if (brandcode == 'D') {
          return 'Dodge';
        }
        if (brandcode == 'F') {
          return 'Fiat';
        }
        if (brandcode == 'J') {
          return 'Jeep';
        }
      }
    }
    if (man == "Fuji Heavy Industries (Subaru)") {
      return 'Subaru'
    }
    if (man == 'Nissan') {
      // ftp://safercar.gov/MfrMail/ORG7377.pdf "MY12 Nissan VIN Coding System"
      // https://vpic.nhtsa.dot.gov/mid/home/displayfile/29173 "MY16 Nissan VIN Coding System"
      // say Ininiti if offset 4 is [JVY], Nissan otherwise.
      // ftp://safercar.gov/MfrMail/ORG6337.pdf "MY11 Nissan VIN Coding System"
      // says that plus Infiniti if offset 4 + 5 are S1.  (Nissan Rogue is S5.)
      // ftp://ftp.nhtsa.dot.gov/mfrmail/ORG7846.pdf "MY13 Nissan VIN Coding System"
      // says that plus Infiniti if offset 4 + 5 are L0.
      if ("JVY".includes(this.vin[4]) || this.vin.slice(4, 6) === 'S1' || this.vin.slice(4, 6) === 'L0') {
        return 'Infiniti'
      }
      if (man == 'Renault Samsung') {
        // FIXME: they build other makes, too
        return 'Nissan'
      }
      if (man == 'Subaru-Isuzu Automotive') {
        return 'Subaru'
      }
    }
    return man;
  }

  year() {
    // Returns the model year of the vehicle
    if (this.is_pre_2010()) {
      return C.YEARS_CODES_PRE_2010[this.vin[9]];
    } else {
      return C.YEARS_CODES_PRE_2040[this.vin[9]];
    }
  }
}

module.exports = VIN;