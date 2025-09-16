
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime
} = require('./runtime/wasm.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}





/**
 * Enums
 */
exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});

exports.Prisma.StudentScalarFieldEnum = {
  studentId: 'studentId',
  classCode: 'classCode',
  attendanceNumber: 'attendanceNumber',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RecreationScalarFieldEnum = {
  recreationId: 'recreationId',
  title: 'title',
  description: 'description',
  location: 'location',
  startTime: 'startTime',
  endTime: 'endTime',
  maxParticipants: 'maxParticipants',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ParticipationScalarFieldEnum = {
  participationId: 'participationId',
  studentId: 'studentId',
  recreationId: 'recreationId',
  status: 'status',
  registeredAt: 'registeredAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  Student: 'Student',
  Recreation: 'Recreation',
  Participation: 'Participation'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/hiramatsutakumi/IdeaProjects/work/req/be/src/generated/prisma",
      "fromEnvVar": null
    },
    "config": {
      "url": "(function)",
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64",
        "native": true
      }
    ],
    "previewFeatures": [
      "driverAdapters"
    ],
    "sourceFilePath": "/Users/hiramatsutakumi/IdeaProjects/work/req/be/prisma/schema.prisma",
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../../.env",
    "schemaEnvPath": "../../../.env"
  },
  "relativePath": "../../../prisma",
  "clientVersion": "5.22.0",
  "engineVersion": "605197351a3c8bdd595af2d2a9bc3025bca48ea2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "sqlite",
  "postinstall": false,
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\ngenerator client {\n  provider        = \"prisma-client-js\"\n  url             = env(\"DATABASE_URL\")\n  output          = \"../src/generated/prisma\"\n  previewFeatures = [\"driverAdapters\"]\n}\n\ndatasource db {\n  provider = \"sqlite\"\n  url      = env(\"DATABASE_URL\")\n}\n\nmodel Student {\n  studentId        Int      @id @map(\"student_id\")\n  classCode        String   @map(\"class_code\")\n  attendanceNumber Int      @map(\"attendance_number\")\n  name             String\n  createdAt        DateTime @default(now()) @map(\"created_at\")\n  updatedAt        DateTime @updatedAt @map(\"updated_at\")\n\n  // Relations\n  participations Participation[]\n\n  @@map(\"students\")\n}\n\nmodel Recreation {\n  recreationId    Int      @id @default(autoincrement()) @map(\"recreation_id\")\n  title           String\n  description     String?\n  location        String\n  startTime       Int      @map(\"start_time\") // 0910形式\n  endTime         Int      @map(\"end_time\") // 1630形式\n  maxParticipants Int      @map(\"max_participants\")\n  status          String   @default(\"scheduled\")\n  createdAt       DateTime @default(now()) @map(\"created_at\")\n  updatedAt       DateTime @updatedAt @map(\"updated_at\")\n\n  // Relations\n  participations Participation[]\n\n  @@map(\"recreations\")\n}\n\nmodel Participation {\n  participationId Int      @id @default(autoincrement()) @map(\"participation_id\")\n  studentId       Int      @map(\"student_id\")\n  recreationId    Int      @map(\"recreation_id\")\n  status          String   @default(\"registered\")\n  registeredAt    DateTime @default(now()) @map(\"registered_at\")\n  createdAt       DateTime @default(now()) @map(\"created_at\")\n  updatedAt       DateTime @updatedAt @map(\"updated_at\")\n\n  // Relations\n  student    Student    @relation(fields: [studentId], references: [studentId])\n  recreation Recreation @relation(fields: [recreationId], references: [recreationId])\n\n  @@unique([studentId, recreationId])\n  @@map(\"participations\")\n}\n",
  "inlineSchemaHash": "924e5e2482118c5609bdcb224da7d8956615b1e25caf3a7198509e8cd4770667",
  "copyEngine": true
}
config.dirname = '/'

config.runtimeDataModel = JSON.parse("{\"models\":{\"Student\":{\"fields\":[{\"name\":\"studentId\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"student_id\"},{\"name\":\"classCode\",\"kind\":\"scalar\",\"type\":\"String\",\"dbName\":\"class_code\"},{\"name\":\"attendanceNumber\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"attendance_number\"},{\"name\":\"name\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"created_at\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"updated_at\"},{\"name\":\"participations\",\"kind\":\"object\",\"type\":\"Participation\",\"relationName\":\"ParticipationToStudent\"}],\"dbName\":\"students\"},\"Recreation\":{\"fields\":[{\"name\":\"recreationId\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"recreation_id\"},{\"name\":\"title\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"description\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"location\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"startTime\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"start_time\"},{\"name\":\"endTime\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"end_time\"},{\"name\":\"maxParticipants\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"max_participants\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"created_at\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"updated_at\"},{\"name\":\"participations\",\"kind\":\"object\",\"type\":\"Participation\",\"relationName\":\"ParticipationToRecreation\"}],\"dbName\":\"recreations\"},\"Participation\":{\"fields\":[{\"name\":\"participationId\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"participation_id\"},{\"name\":\"studentId\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"student_id\"},{\"name\":\"recreationId\",\"kind\":\"scalar\",\"type\":\"Int\",\"dbName\":\"recreation_id\"},{\"name\":\"status\",\"kind\":\"scalar\",\"type\":\"String\"},{\"name\":\"registeredAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"registered_at\"},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"created_at\"},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"type\":\"DateTime\",\"dbName\":\"updated_at\"},{\"name\":\"student\",\"kind\":\"object\",\"type\":\"Student\",\"relationName\":\"ParticipationToStudent\"},{\"name\":\"recreation\",\"kind\":\"object\",\"type\":\"Recreation\",\"relationName\":\"ParticipationToRecreation\"}],\"dbName\":\"participations\"}},\"enums\":{},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.engineWasm = {
  getRuntime: () => require('./query_engine_bg.js'),
  getQueryEngineWasmModule: async () => {
    const loader = (await import('#wasm-engine-loader')).default
    const engine = (await loader).default
    return engine 
  }
}

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL: typeof globalThis !== 'undefined' && globalThis['DATABASE_URL'] || typeof process !== 'undefined' && process.env && process.env.DATABASE_URL || undefined
  }
})

if (typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined) {
  Debug.enable(typeof globalThis !== 'undefined' && globalThis['DEBUG'] || typeof process !== 'undefined' && process.env && process.env.DEBUG || undefined)
}

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

