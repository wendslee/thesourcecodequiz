exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, name, quiz_result } = JSON.parse(event.body);

  const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiZjU4MDQ2MjZjNmVmYzhlZTQzN2EyMGI5ODI1ZGRkYzQ3YTEwMjIzNzRmZmZhYTQ0NzFiMThhZThjMjljNmI1NWJmZTE0MzYwZTc2ZTg4MTQiLCJpYXQiOjE3Nzc5MjA4ODQuNTQ0NjExLCJuYmYiOjE3Nzc5MjA4ODQuNTQ0NjEzLCJleHAiOjQ5MzM1OTQ0ODQuNTQwNDcsInN1YiI6IjIzMzAxOTgiLCJzY29wZXMiOltdfQ.ebM8uNakQoSRJVbbdM3eBarjBOiDVf15glqgV8h7sorobW3GDd8-oP5AnkutACdqmSMnO1dqRTfQQJ0aljPld-G6LXyaVfECaZx5ux0a2UmVxYRrPd7EtEpvsODFzLMojEiIH852B8FiMFMYn6QUG-GSEpirtLZREj4jdrXuKgNJ_pdjRSt3g47nKpo0uscSV_Waa2ELyVuHKnuWXMpaY0WgikHxvRNnkq6fi830xx5lGyLm54fiA8DMbJLyfTdy2gxdDVDdc4ekl19WE4TM9W22W8ZLFN-M3-bX5dvVBloMz3L4TWicphnG6bBsPmZYHe05slMKwue9Qmur90FTc-YtSC6LJ5MSmqDnoly8xogiNPYklPszFJ-auvraAdFMOsZBc8_f1-z5lr8uHxquvtl12ShLJ3Xu4CoQq87GatrDbafWyzecrPTdPtVGd9f6DXeZ0j05rmHibr7Kh_LlI6KnUeHg8p0QIz4arC78gFbguwFmaAaheSg_mCFe90fpF0xuioXU-OGUvxqnIWgMxLdr6repBePt_w3eewkF4mGSGvF03OXKgXiqy1Wu5UbVMfk1gK44OzJDia2jYbTLoDoR8raTf8ulJS6egrGfL_C2NiitysB5XhPL_6o0mAjKjK3iLn7SLBoaJoDdcxpE4zdqm5y9MWKElWZs-LSVjJs';
  const GROUP_ID = '186385386746939140';

  const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      email,
      fields: { name, quiz_result },
      groups: [GROUP_ID]
    })
  });

  const data = await response.json();

  return {
    statusCode: response.ok ? 200 : 500,
    body: JSON.stringify(data)
  };
};
