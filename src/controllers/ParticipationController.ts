import { Context } from 'hono'

export class ParticipationController {
  constructor(private participationService: any) {}

  async getStudentParticipations(c: Context) {
    try {
      const studentId = c.req.param('studentId')
      const status = c.req.query('status')
      const fromDate = c.req.query('from_date')
      const toDate = c.req.query('to_date')

      const participations = await this.participationService.getStudentParticipations(studentId, {
        status,
        fromDate,
        toDate
      })

      return c.json(participations)
    } catch (error) {
      console.error('Error in getStudentParticipations:', error)
      return c.json({ 
        error: 'Failed to fetch student participations', 
        details: error instanceof Error ? error.message : String(error) 
      }, 500)
    }
  }

  async getRecreationParticipants(c: Context) {
    try {
      const recreationId = parseInt(c.req.param('recreationId'))
      const participants = await this.participationService.getRecreationParticipants(recreationId)
      return c.json(participants)
    } catch (error) {
      console.error('Error in getRecreationParticipants:', error)
      return c.json({ 
        error: 'Failed to fetch recreation participants', 
        details: error instanceof Error ? error.message : String(error) 
      }, 500)
    }
  }

  async createParticipation(c: Context) {
    try {
      const body = await c.req.json()
      const participation = await this.participationService.createParticipation(body)
      return c.json(participation, 201)
    } catch (error) {
      console.error('Error in createParticipation:', error)
      
      if (error instanceof Error) {
        if (error.message === 'Student not found') {
          return c.json({ error: 'Student not found', code: 'STUDENT_NOT_FOUND' }, 400)
        }
        if (error.message === 'Recreation not found') {
          return c.json({ error: 'Recreation not found', code: 'RECREATION_NOT_FOUND' }, 400)
        }
        if (error.message === 'Already registered for this recreation') {
          return c.json({ error: 'Already registered for this recreation', code: 'ALREADY_REGISTERED' }, 409)
        }
        if (error.message === 'Recreation is full') {
          return c.json({ error: 'Recreation is full', code: 'RECREATION_FULL' }, 409)
        }
      }
      
      return c.json({ 
        error: 'Failed to create participation', 
        details: error instanceof Error ? error.message : String(error) 
      }, 400)
    }
  }

  async cancelParticipation(c: Context) {
    try {
      const participationId = parseInt(c.req.param('participationId'))
      await this.participationService.cancelParticipation(participationId)
      return c.body(null, 204)
    } catch (error) {
      console.error('Error in cancelParticipation:', error)
      
      if (error instanceof Error && error.message === 'Participation not found') {
        return c.json({ error: 'Participation not found', code: 'PARTICIPATION_NOT_FOUND' }, 404)
      }
      
      return c.json({ 
        error: 'Failed to cancel participation', 
        details: error instanceof Error ? error.message : String(error) 
      }, 400)
    }
  }
}