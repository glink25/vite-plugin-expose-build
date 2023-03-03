import Koa from 'koa';
import koaStatic from 'koa-static';

const app = new Koa();
app.use(new koaStatic('dist',{setHeaders:(res)=>{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
}}));
app.listen(8877, () => {
  console.log(`Target site run at: localhost:${8877}`);
});

const app2 = new Koa();
app2.use(new koaStatic('external_site'));
app2.listen(8899, () => {
  console.log(`External site run at: localhost:${8899}`);
});
