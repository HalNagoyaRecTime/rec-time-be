import { getDb } from '../lib/db';
import { createStudentRepository } from '../repositories/StudentRepository';
import { createStudentService } from '../services/StudentService';
import { createStudentController } from '../controllers/StudentController';
import { createEventRepository } from '../repositories/EventRepository';
import { createEventService } from '../services/EventService';
import { createEventController } from '../controllers/EventController';
import { createEntryRepository } from '../repositories/EntryRepository';
import { createEntryService } from '../services/EntryService';
import { createEntryController } from '../controllers/EntryController';
export function createDIContainer(env) {
    const db = getDb(env);
    if (!db) {
        throw new Error('Database is not available');
    }
    // Repositories
    const studentRepository = createStudentRepository(db);
    const eventRepository = createEventRepository(db);
    const entryRepository = createEntryRepository(db);
    // Services
    const studentService = createStudentService(studentRepository);
    const eventService = createEventService(eventRepository);
    const entryService = createEntryService(entryRepository);
    // Controllers (function-based)
    const studentController = createStudentController(studentService);
    const eventController = createEventController(eventService);
    const entryController = createEntryController(entryService);
    return {
        db,
        studentController,
        eventController,
        entryController,
    };
}
let containerInstance = null;
export function getDIContainer(env) {
    // Cloudflare Workers環境では毎回新しいインスタンスを作成
    if (env) {
        return createDIContainer(env);
    }
    // ローカル開発環境ではシングルトンを使用
    if (!containerInstance) {
        containerInstance = createDIContainer();
    }
    return containerInstance;
}
