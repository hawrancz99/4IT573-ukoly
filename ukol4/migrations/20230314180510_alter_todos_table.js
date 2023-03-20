/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function (knex) {
  await knex.schema.alterTable('todos', (table) => {
    table.string('priority').notNullable()
    table.string('deadline').notNullable()
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function (knex) {
  await knex.schema.alterTable('todos', (table) => {
    table.dropColumn('priority')
    table.dropColumn('deadline')
  })

}
