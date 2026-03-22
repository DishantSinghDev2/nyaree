// lib/db/fake-mongoose.ts
export class Schema {
  public static Types = { ObjectId: String, Mixed: Object };
  constructor(public definition?: any, public options?: any) {}
  index(...args: any[]) {}
}

export const models: Record<string, any> = {};

class QueryProxy {
  modelName: string;
  chain: any[];
  
  constructor(modelName: string, chain: any[] = []) {
    this.modelName = modelName;
    this.chain = chain;
  }

  // Common chainable methods
  find(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'find', args }]); }
  findOne(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'findOne', args }]); }
  findById(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'findById', args }]); }
  findByIdAndUpdate(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'findByIdAndUpdate', args }]); }
  findByIdAndDelete(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'findByIdAndDelete', args }]); }
  updateOne(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'updateOne', args }]); }
  updateMany(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'updateMany', args }]); }
  deleteOne(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'deleteOne', args }]); }
  deleteMany(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'deleteMany', args }]); }
  create(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'create', args }]); }
  insertMany(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'insertMany', args }]); }
  countDocuments(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'countDocuments', args }]); }
  estimatedDocumentCount(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'estimatedDocumentCount', args }]); }
  aggregate(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'aggregate', args }]); }

  // Query modifiers
  sort(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'sort', args }]); }
  limit(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'limit', args }]); }
  skip(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'skip', args }]); }
  select(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'select', args }]); }
  populate(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'populate', args }]); }
  lean(...args: any[]) { return new QueryProxy(this.modelName, [...this.chain, { method: 'lean', args }]); }
  
  // Execution
  async exec() {
    const PROXY_URL = process.env.DB_PROXY_URL;
    const PROXY_TOKEN = process.env.PROXY_AUTH_TOKEN;
    
    const method = this.chain[0]?.method;
    let fallback: any = null;
    if (['find', 'aggregate'].includes(method)) fallback = [];
    if (['countDocuments', 'estimatedDocumentCount'].includes(method)) fallback = 0;

    if (!PROXY_URL) {
       console.error(`[Mongoose Proxy] DB_PROXY_URL missing!`);
       return fallback;
    }
    try {
      const res = await fetch(`${PROXY_URL}/api/db/${this.modelName}/chain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-proxy-token': PROXY_TOKEN || '' },
        body: JSON.stringify({ chain: this.chain }),
        cache: 'no-store'
      });
      const data = await res.json();
      if (!data.success) {
        console.error(`[Mongoose Proxy Error]`, data.error);
        return fallback;
      }
      
      // Recursively revive date strings into Date objects
      const reviveDates = (obj: any): any => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(reviveDates);
        const res: any = {};
        for (const [k, v] of Object.entries(obj)) {
          if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(v)) {
            res[k] = new Date(v);
          } else {
            res[k] = reviveDates(v);
          }
        }
        return res;
      };

      return reviveDates(data.data);
    } catch(e) {
      console.error(`[Mongoose Proxy Fetch Error]`, e);
      return fallback;
    }
  }
  
  then<TResult1 = any, TResult2 = never>(
    onfulfilled?: ((value: any) => TResult1 | PromiseLike<TResult1>) | undefined | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null
  ): Promise<TResult1 | TResult2> {
    return this.exec().then(onfulfilled, onrejected);
  }
}

export function model(name: string, schema?: any) {
  if (!models[name]) {
    models[name] = new QueryProxy(name);
  }
  return models[name];
}

const fakeMongoose = {
  Schema,
  model,
  models,
  connect: async () => true,
  connection: { readyState: 1 },
  Types: { ObjectId: String, Mixed: Object }
};

export default fakeMongoose;
