import { setPreference } from "@/app/(typer)/settings/actions";
import { AnonymousPermissions, Preferences, Theme } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

export async function setSpecificPreference(
  key: keyof Preferences,
  value: boolean | AnonymousPermissions | Theme,
  setPreferences: Dispatch<SetStateAction<Preferences | null>>
) {
  const data: any = {};
  data[key] = value;

  setPreferences((prev) => ({
    ...(prev as Preferences),
    data,
  }));

  await setPreference(key, value);
}