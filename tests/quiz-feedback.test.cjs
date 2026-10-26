const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const ts = require('typescript')
const vm = require('node:vm')

function loadModule(file, dependencies) {
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  const exports = {}
  vm.runInNewContext(code, { exports, require: name => dependencies[name] ?? require(name) })
  return exports
}

const id = '12345678-1234-1234-1234-123456789abc'
function setup({ user = { id: 'student' }, data = null, error = null } = {}) {
  const filters = []
  const query = {
    select() { return this },
    eq(...args) { filters.push(args); return this },
    not(...args) { filters.push(args); return this },
    async maybeSingle() { return { data, error } },
  }
  const { GET } = loadModule('app/api/quiz/feedback/route.ts', {
    '@/lib/supabase/server': { createClient: () => ({
      auth: { getUser: async () => ({ data: { user } }) },
      from: () => query,
    }) },
    'next/server': { NextResponse: { json: (body, options = {}) => ({ body, status: options.status ?? 200, headers: options.headers }) } },
  })
  return { filters, get: (attemptId = id) => GET({ nextUrl: new URL(`http://localhost/api/quiz/feedback?attemptId=${attemptId}`) }) }
}

test('rejects invalid IDs and unauthenticated requests', async () => {
  assert.equal((await setup().get('invalid')).status, 400)
  assert.equal((await setup({ user: null }).get()).status, 401)
})

test('requires a submitted attempt owned by the current student', async () => {
  const { get, filters } = setup()
  assert.equal((await get()).status, 404)
  assert.deepEqual(filters, [
    ['id', id], ['enrollments.student_id', 'student'], ['submitted_at', 'is', null],
  ])
})

test('returns ordered feedback without caching and tolerates deleted questions', async () => {
  const { get } = setup({ data: { attempt_answers: [
    { id: 'second', questions: { order: 2, id: 'b', explanation: 'Porque…' } },
    { id: 'deleted', questions: null },
    { id: 'first', questions: { order: 1, id: 'a' } },
  ] } })
  const result = await get()
  assert.equal(result.status, 200)
  assert.equal(result.headers['Cache-Control'], 'private, no-store')
  assert.equal(result.body.answers.map(a => a.id).join(','), 'first,second')
  assert.equal(result.body.answers[1].questions.explanation, 'Porque…')
})

test('reports database failures', async () => {
  assert.equal((await setup({ error: { message: 'Database error' } }).get()).status, 500)
})

test('shows option text, multiple selections, false, and unanswered questions correctly', () => {
  const { formatQuizAnswer: format } = loadModule('components/QuizFeedback.tsx', {})
  const choice = { type: 'multiple_choice', options: [{ id: 'a', text: 'Primera' }, { id: 'b', text: 'Segunda' }] }
  assert.equal(format('a', choice), 'Primera')
  assert.equal(format(['b', 'a'], choice), 'Segunda; Primera')
  assert.equal(format(false, { type: 'true_false' }), 'Falso')
  assert.equal(format('true', { type: 'true_false' }), 'Verdadero')
  assert.equal(format([], choice), 'Sin respuesta')
  assert.equal(format(null, choice), 'Sin respuesta')
  assert.equal(format('Texto libre', { type: 'essay' }), 'Texto libre')
})
