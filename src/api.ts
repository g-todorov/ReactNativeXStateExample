import uuid from "react-native-uuid";
import {
  storage,
  AUTH_STORAGE_KEY,
  USERS_STORAGE_KEY,
  CURRENT_USER_ID_KEY,
  ONBOARDING_USERS_STORAGE_KEY,
} from "./storage";
import { AuthUser, Item, User } from "./types";

let currentUserId = storage.getString(CURRENT_USER_ID_KEY) ?? null;

function timeout<T>(response: T, milliseconds: number): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(response), milliseconds),
  );
}

export function onAuthStateChanged(callback: (user: AuthUser | null) => void) {
  return storage.addOnValueChangedListener((changedKey) => {
    if (changedKey === AUTH_STORAGE_KEY) {
      try {
        const authUsers: AuthUser[] = JSON.parse(
          storage.getString(changedKey) as string,
        );

        const currentAuthUser = authUsers.find((authUser) => {
          return authUser.uid === currentUserId && authUser.signed;
        });

        callback(currentAuthUser ?? null);
      } catch (error) {
        callback(null);
      }
    }
  });
}

export function getCurrentUser(): AuthUser | null {
  try {
    const authUsers: AuthUser[] = JSON.parse(
      storage.getString(AUTH_STORAGE_KEY) as string,
    );

    const currentAuthUser =
      authUsers.find((authUser) => {
        return authUser.uid === currentUserId && authUser.signed;
      }) ?? null;

    return currentAuthUser;
  } catch (error) {
    return null;
  }
}

export async function signInWithPhone(phoneNumber: string) {
  await timeout({ status: "success" }, 500);

  const authUsers: AuthUser[] = JSON.parse(
    (storage.getString(AUTH_STORAGE_KEY) as string) ?? "[]",
  );

  const existingUser = authUsers?.findIndex((authUser) => {
    return authUser.phoneNumber === phoneNumber;
  });

  if (existingUser !== -1) {
    const userId = authUsers[existingUser].uid;
    currentUserId = userId as string;
    storage.set(CURRENT_USER_ID_KEY, userId as string);

    storage.set(
      AUTH_STORAGE_KEY,
      JSON.stringify([
        ...(authUsers ?? []),
        { ...authUsers[existingUser], signed: true },
      ]),
    );
  } else {
    const userId = uuid.v4();
    currentUserId = userId as string;
    storage.set(CURRENT_USER_ID_KEY, userId as string);

    storage.set(
      AUTH_STORAGE_KEY,
      JSON.stringify([
        ...(authUsers ?? []),
        { phoneNumber, uid: userId, signed: true },
      ]),
    );
  }
}

export async function signOut() {
  await timeout({ status: "success" }, 2000);

  const authUsers: AuthUser[] = JSON.parse(
    storage.getString(AUTH_STORAGE_KEY) as string,
  );

  const currentAuthUserIndex =
    authUsers.findIndex((authUser) => {
      return authUser.uid === currentUserId && authUser.signed;
    }) ?? null;

  storage.set(
    AUTH_STORAGE_KEY,
    JSON.stringify([
      ...(authUsers ?? []),
      { ...authUsers[currentAuthUserIndex], signed: false },
    ]),
  );

  currentUserId = null;
  storage.delete(CURRENT_USER_ID_KEY);

  // Leaving for debug purposes
  // storage.delete(USERS_STORAGE_KEY);
  // storage.delete(AUTH_STORAGE_KEY);
  // storage.delete(ONBOARDING_USERS_STORAGE_KEY);
}

export async function readFromDb(path: string) {
  await timeout({ status: "success" }, 2000);

  const [collection, uid] = path.split("/");

  let users: { [key: string]: User } = JSON.parse(
    storage.getString(collection === "users" ? USERS_STORAGE_KEY : "") ?? "{}",
  );

  if (uid && users[uid]) {
    return users[uid];
  } else {
    return undefined;
  }
}

export async function onboard(data: User) {
  await timeout({ status: "success" }, 2000);

  const users: { [key: string]: User } | null = JSON.parse(
    storage.getString(USERS_STORAGE_KEY) ?? "null",
  );

  if (currentUserId) {
    storage.set(
      USERS_STORAGE_KEY,
      JSON.stringify({ ...users, ...{ [currentUserId]: data } }),
    );
  } else {
    throw new Error("No active session!");
  }
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
