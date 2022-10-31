import http from 'k6/http'
import { sleep } from 'k6'

// export const options = {
//   scenarios: {
//     open_model: {
//       executor: 'constant-arrival-rate',
//       rate: 500,
//       timeUnit: '1s',
//       duration: '1m',
//       preAllocatedVUs: 15000,
//       //maxVUs: 10000
//     }
//   }
// }


export let options = {
  insecureSkipTLSVerify: true,
  noConnectionReuse: false,
  stages: [
    { duration: '1m', target: 1 },
    { duration: '2m', target: 10 },
    { duration: '2m', target: 100 },
    { duration: '2m', target: 1000 },
    { duration: '1m', target: 0 }
  ]
}

export default function() {
  http.get('http://localhost:3000/questions/900012')
  //sleep(1);
}