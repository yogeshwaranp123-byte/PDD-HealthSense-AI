import os
import json
import uuid
from datetime import datetime
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import certifi
from app.core.config import get_settings

settings = get_settings()

client = None
is_mock = False

class MockInsertOneResult:
    def __init__(self, inserted_id):
        self.inserted_id = inserted_id

class MockCursor:
    def __init__(self, docs):
        self.docs = docs
        self.index = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self.index >= len(self.docs):
            raise StopAsyncIteration
        doc = self.docs[self.index]
        self.index += 1
        return doc

class MockCollection:
    def __init__(self, name, db_client):
        self.name = name
        self.db_client = db_client

    def _get_docs(self):
        return self.db_client.data.setdefault(self.name, [])

    def _save(self):
        self.db_client.save()

    def _match_query(self, doc, query):
        for k, v in query.items():
            doc_v = doc.get(k)
            # Normalize IDs for matching
            if k in ("_id", "user_id") or isinstance(v, ObjectId) or (doc_v is not None and doc_v.__class__.__name__ == 'ObjectId'):
                if str(doc_v) != str(v):
                    return False
            else:
                if doc_v != v:
                    return False
        return True

    async def find_one(self, query):
        docs = self._get_docs()
        for doc in docs:
            if self._match_query(doc, query):
                return dict(doc)
        return None

    async def insert_one(self, doc):
        docs = self._get_docs()
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4().hex[:24])
        doc_copy = dict(doc)
        docs.append(doc_copy)
        self._save()
        return MockInsertOneResult(doc_copy["_id"])

    async def update_one(self, query, update_data):
        docs = self._get_docs()
        for doc in docs:
            if self._match_query(doc, query):
                set_data = update_data.get("$set", {})
                for k, v in set_data.items():
                    doc[k] = v
                self._save()
                return True
        return False

    def find(self, query, sort=None):
        docs = self._get_docs()
        matched = []
        for doc in docs:
            if self._match_query(doc, query):
                matched.append(dict(doc))
        
        if sort:
            for key, direction in reversed(sort):
                matched.sort(
                    key=lambda x: x.get(key) if x.get(key) is not None else "",
                    reverse=(direction == -1)
                )
        return MockCursor(matched)

class MockDatabase:
    def __init__(self, db_client):
        self.db_client = db_client
        self.users = MockCollection("users", db_client)
        self.predictions = MockCollection("predictions", db_client)

    def __getitem__(self, name):
        return self

class MockMongoClient:
    def __init__(self, filename):
        self.filename = filename
        self.data = {}
        self.load()

    def load(self):
        if os.path.exists(self.filename):
            try:
                with open(self.filename, "r") as f:
                    self.data = json.load(f)
                    for coll in ["users", "predictions"]:
                        if coll in self.data:
                            for doc in self.data[coll]:
                                if "created_at" in doc and isinstance(doc["created_at"], str):
                                    try:
                                        doc["created_at"] = datetime.fromisoformat(doc["created_at"])
                                    except:
                                        pass
            except Exception as e:
                print(f"[WARNING] Could not load mock DB from {self.filename}: {e}")
                self.data = {}
        else:
            self.data = {}

    def save(self):
        def json_serial(obj):
            if isinstance(obj, (datetime,)):
                return obj.isoformat()
            if isinstance(obj, ObjectId):
                return str(obj)
            raise TypeError("Type %s not serializable" % type(obj))

        try:
            with open(self.filename, "w") as f:
                json.dump(self.data, f, default=json_serial, indent=2)
        except Exception as e:
            print(f"[WARNING] Could not save mock DB: {e}")

    def __getitem__(self, name):
        return MockDatabase(self)

    def close(self):
        pass


async def connect_db():
    global client, is_mock
    # Try connecting to Atlas with a timeout
    try:
        print("[DB] Attempting connection to MongoDB Atlas...")
        client = AsyncIOMotorClient(
            settings.MONGO_URI, 
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000
        )
        # Force a connection check by pinging admin database
        await client.admin.command('ping')
        is_mock = False
        print("[OK] Successfully connected to MongoDB Atlas!")
    except Exception as e:
        print(f"[WARNING] MongoDB Atlas SSL/TLS connection failed: {e}")
        print("[DB] Falling back to local JSON database storage...")
        
        db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "local_db.json")
        client = MockMongoClient(db_path)
        is_mock = True
        print(f"[OK] Initialized Mock DB at {os.path.normpath(db_path)}")


async def close_db():
    global client
    if client:
        client.close()
        print("[--] MongoDB connection closed")


def get_db():
    return client["healthapp"]
