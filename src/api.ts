function timeout(data: any, milliseconds: number) {
  return new Promise((resolve) =>
    setTimeout(() => resolve(data), milliseconds),
  );
}

export async function signIn() {
  return await timeout({ status: "success", user: { name: "John" } }, 500);
}

export async function getItems<T>() {
  return await timeout(
    {
      status: "success",
      items: [
        { title: "Title 1", id: 1 },
        { title: "Title 2", id: 2 },
        { title: "Title 3", id: 3 },
      ],
    } as T,
    500,
  );
}
