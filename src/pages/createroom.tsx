import { Button } from "@/components/ui";
import { useRouter } from "next/router";
import { NavBar } from "@/components/ui/NavBar/NavBar";
import { Footer } from "@/components/ui/Footer/Footer";
import styles from "./Index.module.scss";
import { Input } from "@/components/ui/Input/Input";
import type { FormEvent } from "react";
import React, { useState } from "react";
import { KeyIcon } from "@/assets";
import axios from "axios";
import { setIdentity } from "@/lib/client-utils";
import { hasWallets } from "@/pages/_app";
import { CustomConnectButton } from "@/components/ui/CustomConnectButton/CustomConnectButton";
import { Leaderboard } from "@/components/ui/Leaderboard/Leaderboard";
import { useSession } from "next-auth/react";

export default function IndexPage() {
  const [roomName, setRoomName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<boolean>(false); // состояние ошибки
  const { push } = useRouter();
  const { status } = useSession();

  const onCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!roomName) return;

    try {
      setIsLoading(true);
      const { data } = await axios.post<{ identity: string; slug: string }>(
        "/api/createRoom",
        { roomName }
      );
      setIdentity(data.slug, data.identity);
      await push({
        pathname: `/join/${data.slug}`,
        query: {
          roomName,
        },
      });
    } catch (e) {
      console.error(e);
      setError(true); // устанавливаем ошибку
    }

    setIsLoading(false);
  };

  return (
    <>
      <NavBar>
      </NavBar>

      <div className={styles.container}>
        <h1 className={styles.title}>
          Create a Web3 Meeting
          <br /> and Get Points
        </h1>
        <p className={styles.text}>
          A free, open-source web application for video{"\n"} conferencing with
          built-in AI voice translation,{"\n"} built on&nbsp;
          <a
            rel="noreferrer"
          >
            Vironect app
          </a>
        </p>

        <form onSubmit={(e) => void onCreate(e)}>
          <Input
            placeholder={"Enter a room name"}
            value={roomName}
            setValue={setRoomName}
            startIcon={<KeyIcon />}
            error={error} // передаем ошибку в Input
          />
          {error && <p className={styles.errorText}>Room name already exists.</p>} {/* текст ошибки */}
          <Button
            type={"submit"}
            variant={"default"}
            size={"lg"}
            className={styles.button}
            disabled={!roomName || isLoading}
          >
            Start
          </Button>
        </form>
      </div>

      <Footer />
    </>
  );
}
