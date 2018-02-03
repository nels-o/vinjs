const VIN = require('./vin.js');
console.log(VIN);
const test_vin = 'wba8d9g34hnu64920';
console.log('Testing with', test_vin);

let vin = VIN.decode('WBA8D9G34HNU64920');

console.log('Decoded to', vin.vin);

tests = [
  'country',
  'is_pre_2010',
  'is_valid',
  'less_than_500_built_per_year',
  'region',
  'vis',
  'vds',
  'vsn',
  'wmi',
  'squish_vin',
  'manufacturer',
  'make',
  'year',
]
console.log('--------------------')
console.log(test_vin)
harness = (f) => {
  try {
    console.log('   ', f);
    console.log('        ✔', vin[f]());
  } catch(e) {
    console.error('        ❌\n', e);
  }
}
tests.forEach((f) => harness(f));
