import {trToEnPath,translateQuery,EN_HOST} from '../shared/routes.mjs';
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  if(url.pathname!=='/en'&&!url.pathname.startsWith('/en/'))
    return env.ASSETS.fetch(request);
  // Keep old /en/ assets available until English production no longer fetches them.
  if(env.EN_REDIRECTS_ENABLED!=='true')return env.ASSETS.fetch(request);
  const trPath=url.pathname==='/en'?'/':url.pathname.slice(3);
  const enPath=trToEnPath(trPath);
  if(!enPath)return new Response('Not found',{status:404,headers:{'content-type':'text/plain; charset=utf-8'}});
  const target=new URL(EN_HOST+enPath);
  const query=translateQuery(url.searchParams,'tr-en');
  target.search=query.toString();
  return Response.redirect(target.toString(),301);
 }
};
