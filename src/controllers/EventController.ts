import { Context } from 'hono';
import { EventControllerFunctions } from '../types/controllers';
import { EventServiceFunctions, DownloadLogServiceFunctions } from '../types/services';

export function createEventController(
  eventService: EventServiceFunctions,
  downloadLogService: DownloadLogServiceFunctions
): EventControllerFunctions {
  return {
    getAllEvents: async (c: Context) => {
      try {
        const f_event_code = c.req.query('f_event_code');
        const f_time = c.req.query('f_time');
        const limit = c.req.query('limit');
        const offset = c.req.query('offset');
        const studentNum = c.req.query('student_num'); // 학생 번호 (로그용)

        const result = await eventService.getAllEvents({
          f_event_code,
          f_time,
          limit: limit ? parseInt(limit) : undefined,
          offset: offset ? parseInt(offset) : undefined,
        });

        // 이벤트 다운로드 로그 기록 (학생 번호가 있는 경우만)
        if (studentNum) {
          try {
            await downloadLogService.logEventDataDownload(studentNum, true, result.events.length);
          } catch (logError) {
            console.error('[Event download log error]', logError);
          }
        }

        return c.json({
          events: result.events,
          total: result.total,
          limit: limit ? parseInt(limit) : 50,
          offset: offset ? parseInt(offset) : 0,
        });
      } catch (error) {
        // 에러 발생 시에도 로그 기록
        const studentNum = c.req.query('student_num');
        if (studentNum) {
          try {
            await downloadLogService.logEventDataDownload(studentNum, false);
          } catch (logError) {
            console.error('[Event download log error]', logError);
          }
        }

        return c.json(
          {
            error: 'Failed to fetch events',
            details: error instanceof Error ? error.message : String(error),
          },
          500
        );
      }
    },

    getEventById: async (c: Context) => {
      try {
        const id = parseInt(c.req.param('eventId'));
        const event = await eventService.getEventById(id);
        return c.json(event);
      } catch (error) {
        if (error instanceof Error && error.message === 'Event not found') {
          return c.json(
            { error: 'Event not found', code: 'EVENT_NOT_FOUND' },
            404
          );
        }
        return c.json(
          {
            error: 'Failed to fetch event',
            details: error instanceof Error ? error.message : String(error),
          },
          500
        );
      }
    },
  };
}
