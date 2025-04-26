import { MongoClient, MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI as string;
const options: MongoClientOptions = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Fonksiyonlar

export interface Usage {
    _id?: string;
    userIp: string;
    usage: number;
    lastReset: Date; // Son sıfırlama tarihi
    isBlocked: boolean; // Engelleme durumu
    blockedUntil?: Date; // Engelleme bitiş tarihi
  }
const dbName = "voxactive";
const collectionName = "usages";


export async function createUsage(ip: string, initialUsage: number = 0): Promise<Usage> {
    try {
      const client = await clientPromise;
      const db = client.db(dbName);
      const collection = db.collection<Usage>(collectionName);
  
      // Önce IP'nin var olup olmadığını kontrol et
      const existingUsage = await collection.findOne({ userIp: ip });
      
      if (existingUsage) {
        // Kayıt varsa usage değerini initialUsage kadar artır
        const result = await collection.findOneAndUpdate(
          { userIp: ip },
          { 
            $inc: { usage: initialUsage },
            $set: { 
              lastReset: existingUsage.usage + initialUsage >= DAILY_LIMIT ? new Date() : existingUsage.lastReset,
              isBlocked: existingUsage.usage + initialUsage >= DAILY_LIMIT 
            } 
          },
          { 
            returnDocument: 'after',
            projection: { _id: 1, userIp: 1, usage: 1, lastReset: 1, isBlocked: 1, blockedUntil: 1 }
          }
        );
        
        if (!result) {
          throw new Error("Failed to update existing usage record");
        }
        return result as Usage;
      }
  
      // Yeni kayıt oluştur
      const newUsage: Usage = {
        userIp: ip,
        usage: initialUsage,
        isBlocked: initialUsage >= DAILY_LIMIT,
        lastReset: new Date(),
        ...(initialUsage >= DAILY_LIMIT && { blockedUntil: getNextMidnight() })
      };
  
      const result = await collection.insertOne(newUsage);
      
      if (!result.acknowledged) {
        throw new Error("Failed to create usage record");
      }
  
      return { ...newUsage, _id: result.insertedId };
    } catch (error: any) {
      if (error.code === 11000) {
        console.log(`IP ${ip} already exists`);
        return getUsage(ip) as Promise<Usage>;
      }
      console.error("Error creating/updating usage record:", error);
      throw error;
    }
}

// Yardımcı fonksiyon: Gece yarısını hesapla
function getNextMidnight(): Date {
  const midnight = new Date();
  midnight.setUTCHours(24, 0, 0, 0);
  return midnight;
}
export async function getUsage(ip: string): Promise<Usage | null> {
    try {
      const client = await clientPromise;
      const db = client.db(dbName);
      return await db.collection<Usage>(collectionName).findOne({ userIp: ip });
    } catch (error) {
      console.error("Error getting usage:", error);
      throw error;
    }
  }
  const DAILY_LIMIT = 50000;

  // Kullanımı artırma fonksiyonu
  export async function incrementUsage(ip: string, tokens: number): Promise<Usage> {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection<Usage>(collectionName);
  
    // Önce mevcut kaydı al
    const usage = await collection.findOne({ userIp: ip });
  
    // Gün kontrolü (UTC bazlı)
    const now = new Date();
    const lastReset = usage?.lastReset || now;
    const isNewDay = now.getUTCDate() !== lastReset.getUTCDate() || 
                     now.getUTCMonth() !== lastReset.getUTCMonth() || 
                     now.getUTCFullYear() !== lastReset.getUTCFullYear();
  
    // Yeni günse sıfırla
    if (isNewDay || !usage) {
     const usage = {
        userIp: ip,
        usage: 0,
        lastReset: now,
        isBlocked: false,
        
      };
    }
  
    // Engelleme kontrolü
    if (usage.isBlocked && usage.blockedUntil && usage.blockedUntil > now) {
      throw new Error('IP blocked until next day');
    }
  
    // Limit kontrolü
    if (usage.usage + tokens > DAILY_LIMIT) {
      // Limit aşıldı, engelle
      const nextDay = new Date(now);
      nextDay.setUTCDate(nextDay.getUTCDate() + 1);
      nextDay.setUTCHours(0, 0, 0, 0); // Gece yarısına ayarla
  
      await collection.updateOne(
        { userIp: ip },
        {
          $set: {
            isBlocked: true,
            blockedUntil: nextDay
          }
        }
      );
      throw new Error('Daily limit exceeded. IP blocked until midnight UTC');
    }
  
    // Kullanımı güncelle
    const result = await collection.updateOne(
      { userIp: ip },
      {
        $set: {
          usage: usage.usage + tokens,
          lastReset: isNewDay ? now : usage.lastReset
        },
        $setOnInsert: {
          userIp: ip,
          isBlocked: false
        }
      },
      { upsert: true }
    );
  
    return (await collection.findOne({ userIp: ip }))!;
  }
  
  // Engelleme durumunu kontrol et
  export async function checkBlocked(ip: string): Promise<boolean> {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection<Usage>(collectionName);
  
    const usage = await collection.findOne({ userIp: ip });
    if (!usage) return false;
  
    // Eğer engel süresi dolmuşsa sıfırla
    if (usage.isBlocked && usage.blockedUntil && usage.blockedUntil <= new Date()) {
      await collection.updateOne(
        { userIp: ip },
        {
          $set: {
            isBlocked: false,
            usage: 0,
            lastReset: new Date()
          },
          $unset: {
            blockedUntil: ""
          }
        }
      );
      return false;
    }
  
    return usage.isBlocked || false;
  }


