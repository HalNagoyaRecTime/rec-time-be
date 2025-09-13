import { Context } from 'hono'
import { RecreationControllerFunctions } from '../types/controllers'
import { RecreationServiceFunctions } from '../types/services'

export function createRecreationController(
  recreationService: RecreationServiceFunctions
): RecreationControllerFunctions {

  const getAllRecreations = async (c: Context) => {
    try {
      const status = c.req.query('status')
      const fromDate = c.req.query('from_date')
      const toDate = c.req.query('to_date')
      const limit = c.req.query('limit')
      const offset = c.req.query('offset')

      const result = await recreationService.getAllRecreations({
        status,
        fromDate,
        toDate,
        limit: limit ? parseInt(limit) : undefined,
        offset: offset ? parseInt(offset) : undefined
      })

      return c.json({
        recreations: result.recreations,
        total: result.total,
        limit: limit ? parseInt(limit) : 50,
        offset: offset ? parseInt(offset) : 0
      })
    } catch (error) {
      console.error('Error in getAllRecreations:', error)
      return c.json({ 
        error: 'Failed to fetch recreations', 
        details: error instanceof Error ? error.message : String(error) 
      }, 500)
    }
  }

  const getRecreationById = async (c: Context) => {
    try {
      const id = parseInt(c.req.param('recreationId'))
      const recreation = await recreationService.getRecreationById(id)
      return c.json(recreation)
    } catch (error) {
      console.error('Error in getRecreationById:', error)
      if (error instanceof Error && error.message === 'Recreation not found') {
        return c.json({ error: 'Recreation not found', code: 'RECREATION_NOT_FOUND' }, 404)
      }
      return c.json({ 
        error: 'Failed to fetch recreation', 
        details: error instanceof Error ? error.message : String(error) 
      }, 500)
    }
  }



  return {
    getAllRecreations,
    getRecreationById,
  }
}
