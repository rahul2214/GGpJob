const fs = require('fs');
const path = require('path');
const files = [
  'src/app/api/jobs/route.ts',
  'src/app/api/jobs/[id]/route.ts',
  'src/app/api/payments/verify/route.ts',
  'src/app/api/payments/create-order/route.ts',
  'src/app/api/payments/activate-free/route.ts',
  'src/app/api/linkedin/auto-apply/route.ts',
  'src/app/api/extension/get-answers/route.ts'
];
let changed = 0;
files.forEach(f => {
  let p = path.resolve(f);
  if(fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    let o = c;
    c = c.replace(/\.eq\('id',\s*userId\)/g, ".eq('uuid', userId)");
    c = c.replace(/\.eq\('id',\s*uid\)/g, ".eq('uuid', uid)");
    if(o !== c) {
      fs.writeFileSync(p, c);
      changed++;
      console.log('Fixed: ' + f);
    }
  }
});
console.log('Total fixed: ' + changed);
