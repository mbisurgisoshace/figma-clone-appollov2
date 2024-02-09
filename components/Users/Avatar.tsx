import Image from "next/image";
import styles from "./Avatar.module.css";

const IMAGE_SIZE = 48;

export function Avatar({
  name,
  otherStyles,
}: {
  name: string;
  otherStyles: string;
}) {
  return (
    <div
      className={`${styles.avatar} ${otherStyles} h-9 w-9`}
      data-tooltip={name}
    >
      <Image
        alt={name}
        height={IMAGE_SIZE}
        width={IMAGE_SIZE}
        className={styles.avatar_picture}
        src={`https://liveblocks.io/avatars/avatar-${Math.floor(
          Math.random() * 30
        )}.png`}
      />
    </div>
  );
}
