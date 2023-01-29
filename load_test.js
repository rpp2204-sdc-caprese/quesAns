import http from 'k6/http'
import { sleep } from 'k6'

export const options = {
  scenarios: {
    open_model: {
      executor: 'constant-arrival-rate',
      rate: 500,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 5000,
      //maxVUs: 10000
    }
  }
}

// export let options = {
//   insecureSkipTLSVerify: true,
//   noConnectionReuse: false,
//   stages: [
//     { duration: '2m', target: 1000 },
//     { duration: '2m', target: 1000 },
//     { duration: '2m', target: 2000 },
//     { duration: '2m', target: 2000 },
//     { duration: '2m', target: 3000 },
//     { duration: '2m', target: 3000 },
//     { duration: '2m', target: 4000 },
//     { duration: '2m', target: 4000 },
//     { duration: '2m', target: 5000 },
//     { duration: '2m', target: 5000 },
//     { duration: '3m', target: 0 }
//   ]
// }

// export const options = {
//   discardResponseBodies: true,

//   scenarios: {
//     contacts: {
//       executor: 'ramping-arrival-rate',

//       startRate: 100,
//       timeUnit: '1s',
//       preAllocatedVUs: 100,
//       maxVUs: 5000,

//       stages: [
//         { target: 300, duration: '2m' },
//         { target: 400, duration: '2m' },
//         { target: 500, duration: '2m' },
//         { target: 600, duration: '2m' },
//       ]
//     }
//   }
// }

export default function() {
  let min = 900000
  let max = 1000010
  let range = Math.floor(Math.random() * (max - min + 1) + min);
  http.get(`http://localhost:3001/qa/questions?product_id=${range}`)
  //sleep(1);
}