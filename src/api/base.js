import { fetch } from '@/utils/fetch';

export function getExternalSceneDrawStatus(data) {
  return fetch({
    url: '/external/scene/drawStatus',
    method: 'put',
    data: data
  });
}

export function getExternalSceneDraw(data) {
  return fetch({
    url: '/external/scene/draw',
    method: 'post',
    data: data
  });
}
