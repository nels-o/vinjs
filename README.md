# vinjs
VIN tools for javascript

# Usage

```
let vin = VIN.decode('WBA8D9G34HNU64920');
console.log('is valid:', vin.is_valid()));
console.log('region:', vin.region()));
console.log('country:', vin.country()));
console.log('manufacturer:', vin.manufacturer()));
console.log('make:', vin.make()));
console.log('year:', vin.year()));
console.log('is pre 2010:', vin.is_pre_2010()));
console.log('less than 500 built per year:', vin.less_than_500_built_per_year()));
console.log('squish vin:', vin.squish_vin()));
console.log('vis:', vin.vis()));
console.log('vds:', vin.vds()));
console.log('vsn:', vin.vsn()));
console.log('wmi:', vin.wmi()));
```