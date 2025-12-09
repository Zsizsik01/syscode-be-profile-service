function mockResponse(ok: boolean, body: any, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Bad Request',
    json: async () => body,
    text: async () => JSON.stringify(body),
    headers: new Headers(),
    redirected: false,
    url: '',
  } as unknown as Response;
}

global.fetch = jest.fn(async (url: string, options: any) => {
  if (options?.method === 'POST') {
    const data = JSON.parse(options.body);
    return mockResponse(true, { address: data.address });
  }

  if (options?.method === 'GET') {
    return mockResponse(true, { address: 'mock-address' });
  }

  if (options?.method === 'PUT') {
    const data = JSON.parse(options.body);
    return mockResponse(true, { address: data.address });
  }

  if (options?.method === 'DELETE') {
    return mockResponse(true, {});
  }

  return mockResponse(false, {}, 400);
});
