import axios from 'axios';
// import {
//   Message
// } from 'element-ui';
// import router from '../router';

export function fetch(options) {
  return new Promise((resolve, reject) => {
    const instance = axios.create({
      withCredentials: true,
      headers: {},
      baseURL: 'http://192.168.2.222:8088/exam', // api的base_url
      timeout: 10000 // 请求超时时间
    });
    instance(options)
      .then(response => {
        const res = response.data;
        resolve(res);
      })
      .catch(error => {
        reject(error.response);
      });
  });
}

const args = [];
function sum() {
  if (arguments.length) {
    args.push(Array.prototype.slice.call(null, arguments));
  }
  return sum;
}
sum.value = function() {
  let s = 0;
  args.forEach(v => {
    s += v;
  });
  return s;
};
