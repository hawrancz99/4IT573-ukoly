/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function(knex) {
    await knex.schema.alterTable('todos', (table) => {
        table.integer('user_id').unsigned().nullable()
        table.foreign('user_id').references('id').inTable('users');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function(knex) {
    await knex.schema.alterTable('todos', (table) => {
        table.dropForeign('user_id');
        table.dropColumn('user_id')
      })
    
};
