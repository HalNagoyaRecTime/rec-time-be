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

  const createRecreation = async (c: Context) => {
    try {
      const body = await c.req.json()
      const recreation = await recreationService.createRecreation(body)
      return c.json(recreation, 201)
    } catch (error) {
      console.error('Error in createRecreation:', error)
      return c.json({ 
        error: 'Failed to create recreation', 
        details: error instanceof Error ? error.message : String(error) 
      }, 400)
    }
  }

  const updateRecreation = async (c: Context) => {
    try {
      const id = parseInt(c.req.param('recreationId'))
      const body = await c.req.json()
      const recreation = await recreationService.updateRecreation(id, body)
      return c.json(recreation)
    } catch (error) {
      console.error('Error in updateRecreation:', error)
      return c.json({ 
        error: 'Failed to update recreation', 
        details: error instanceof Error ? error.message : String(error) 
      }, 400)
    }
  }

  const deleteRecreation = async (c: Context) => {
    try {
      const id = parseInt(c.req.param('recreationId'))
      await recreationService.deleteRecreation(id)
      return c.json({ message: 'Recreation deleted successfully' })
    } catch (error) {
      console.error('Error in deleteRecreation:', error)
      return c.json({ 
        error: 'Failed to delete recreation', 
        details: error instanceof Error ? error.message : String(error) 
      }, 400)
    }
  }

  return {
    getAllRecreations,
    getRecreationById,
    createRecreation,
    updateRecreation,
    deleteRecreation
  }
}