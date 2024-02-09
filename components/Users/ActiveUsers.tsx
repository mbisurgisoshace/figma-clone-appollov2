import { useOthers, useSelf } from "@/liveblocks.config";

import styles from "./index.module.css";

import { Avatar } from "./Avatar";
import { generateRandomName } from "@/lib/utils";
import { useMemo } from "react";

const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  const memoizedUser = useMemo(
    () => (
      <div className="flex items-center justify-center gap-1">
        <div className="flex pl-3">
          {currentUser && (
            <div className="relative ml-8 first:ml-0">
              <Avatar
                name="You"
                otherStyles="border-[3px] border-primary-green"
              />
            </div>
          )}
          {users.slice(0, 3).map(({ connectionId, info }) => {
            return (
              <Avatar
                key={connectionId}
                otherStyles="-ml-3"
                name={generateRandomName()}
              />
            );
          })}

          {hasMoreUsers && (
            <div className={styles.more}>+{users.length - 3}</div>
          )}
        </div>
      </div>
    ),
    [users.length]
  );

  return memoizedUser;
};

export default ActiveUsers;
