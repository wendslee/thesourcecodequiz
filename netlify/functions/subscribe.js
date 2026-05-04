exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const { email, name, quiz_result } = JSON.parse(event.body);

  const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiYjYxNzBjNTAzZjkyYmZjYWE0YjQ4ZDU4NTA4YzRmOTU2ZmJhNzZmYzdlYjFjYTUyMDIzMjQwNzRkMzNjYTJhN2U4NGM4MWE1OGQ4N2FlYTAiLCJpYXQiOjE3Nzc3NDk5MjcuMTQ0NTg5LCJuYmYiOjE3Nzc3NDk5MjcuMTQ0NTkyLCJleHAiOjQ5MzM0MjM1MjcuMTM3NzU5LCJzdWIiOiIyMzMwMTk4Iiwic2NvcGVzIjpbXX0.I_g-TDMcNw9HpCuQmjK5Lj_sK4tNGhI32HeKHfpBpnm4t1_sQ36mKeBi79SChYoWSye2kILpgZvpHSsQDfTZCuwu-wMI7kdXsf0S-CZ3wOHOSQlmfB0aojHo4V8u9bNszWPsO6s22knIicwoYJt1aG0_9GKLQGEvrWPFLJD6ZO1cEIlSPJM3pDniXoIR8UTajl5HAxQSKxpcr7PzudW0FgNb9Z5BrjiXi0X0pEn24uL57icmFnJu_tHSpU0Mc8O3-nJ0nnm2n1pbCgS_uhOJpDysHd3RJr3Bg2SmnbHs3TTD3opf4oZNNAsXL7ekcHtaQ5-w99HFx5nJpSI5O3P1LdetoXHlJpGQvacKN8u3NWbc1TSeVNbgonC2FuQD0fp2HyxHJO5pnpwGsa3SYZiYfYxeeSbmajH_13STOYim-sqozCM3c-v2vhvMfPR1I_tYlgvm93VINx0FlLX7glBU-xleHgxbHI0nXy3eGmC9BcibZ13GxMixJQw-V-v05vbTlUE-k7xzEFs2he8LKd5yPmTKQNAlMMCLCh1V9vuMNVRhBbqgWx_f2lSOdsqxZZUJ282ShCn67LRquyKwz0S-DO3lwek6fYeQCq1hb4oIUmwj0Y4kckb8iPIBeFe7kvo028baawpjPL25BgIeTqHn_pzd-DnNftoZ6RZaJbpemRoo';
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
