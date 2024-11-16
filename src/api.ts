import uuid from "react-native-uuid";
import { storage, AUTH_STORAGE_KEY } from "./storage";
import { User, Item } from "./types";

function timeout<T>(response: T, milliseconds: number): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(response), milliseconds),
  );
}

export function onAuthStateChanged(callback: (user: User | null) => void) {
  return storage.addOnValueChangedListener((changedKey) => {
    if (changedKey === AUTH_STORAGE_KEY) {
      try {
        callback(JSON.parse(storage.getString(changedKey) as string));
      } catch (error) {
        callback(null);
      }
    }
  });
}

export function getCurrentUser(): User | null {
  try {
    return JSON.parse(storage.getString(AUTH_STORAGE_KEY) as string);
  } catch (error) {
    return null;
  }
}

export async function signInWithPhone(phoneNumber: string) {
  storage.set(AUTH_STORAGE_KEY, JSON.stringify({ phoneNumber }));

  return await timeout(
    { status: "success", user: { phoneNumber, uid: uuid.v4() } },
    5000,
  );
}

export async function signOut() {
  storage.delete(AUTH_STORAGE_KEY);

  return await timeout({ status: "success" }, 500);
}

let items = [
  { title: "Title", id: uuid.v4() },
  { title: "Title", id: uuid.v4() },
  { title: "Title", id: uuid.v4() },
];

export async function getItems(): Promise<{
  status: string;
  items: Item[];
}> {
  return await timeout<{ status: string; items: Item[] }>(
    {
      status: "success",
      items,
    },
    800,
  );
}

export async function addItem(title: Item["title"]): Promise<{
  status: string;
  item: Item;
}> {
  const newItem: Item = { title, id: uuid.v4() };
  items = [...items, newItem];

  return await timeout(
    {
      status: "success",
      item: newItem,
    },
    500,
  );
}

export async function deleteItem(id: Item["id"]): Promise<{
  status: string;
  id: Item["id"];
}> {
  items = items.filter((item) => {
    return item.id !== id;
  });

  return await timeout(
    {
      status: "success",
      id,
    },
    500,
  );
}
