import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';
export const errorRate = new Rate('errors');
export const catalogLatency = new Trend('catalog_latency', true);
export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 25 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
    errors: ['rate<0.05'],
  },
};
const BASE = __ENV.BASE_URL || 'http://localhost:8080';
export default function () {
  const response = http.get(`${BASE}/api/catalog/books`);
  const ok = check(response, { 'catalog returns 200': r => r.status === 200 });
  errorRate.add(!ok);
  catalogLatency.add(response.timings.duration);
  sleep(1);
}
