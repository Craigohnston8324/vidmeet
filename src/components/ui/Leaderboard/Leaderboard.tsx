import type { CSSProperties } from "react";
import React, { useMemo, useState } from "react";
import styles from "./Leaderboard.module.scss";
import {
  ChainIcon,
  CloseIcon,
  InfoIcon,
  LeaderboardIcon,
  PlusIcon,
  TickIcon,
} from "@/assets";
import axios from "axios";
import { clsx } from "clsx";
import type { LeaderboardRecord } from "@/pages/api/leaderboard";
import { INVITE_CODE_QUERY_KEY } from "@/lib/hooks/useInviteCode";
import { CopyIcon } from "lucide-react";
import {
  ADMIN_POINTS_MULTIPLIER,
  BASE_REWARDS_PER_MINUTE,
  REFERRAL_REWARD_PERCENTAGE,
} from "@/pages/api/webhook";

interface Leaderboard {
  buttonStyle?: CSSProperties;
}

export const Leaderboard = ({ buttonStyle }: Leaderboard) => {
  const [open, setOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRecord[]>([]);
  const [instructionOpen, setInstructionOpen] = useState(false);
  const [referralLink, setReferralLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const getPoints = async () => {
    try {
      const { data } = await axios.get<{
        result: LeaderboardRecord[];
        referralCode: string | null;
      }>("/api/leaderboard");

      if (data.referralCode) {
        setReferralLink(
          window.location.origin +
            "?" +
            INVITE_CODE_QUERY_KEY +
            "=" +
            data.referralCode
        );
      }

      setLeaderboard(data.result);
    } catch (e) {
      setOpen(false);
    }
  };

  const currentUserPoints = useMemo(() => {
    return leaderboard.find((r) => r.isCurrentUser)?.points || "";
  }, [leaderboard]);

  const onOpen = () => {
    setOpen(true);
    void getPoints();
  };

  const copy = async () => {
    if (!referralLink) return;
    const url = encodeURI(referralLink);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        style={buttonStyle}
        onClick={onOpen}
        className={styles.leaderBoardButton}
      >
        <LeaderboardIcon />
      </button>

      {open && !instructionOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setOpen(false);
            }
          }}
          className={styles.leaderboardModalWrapper}
        >
          <div className={styles.leaderboardModalContainer}>
            <button
              onClick={() => {
                setOpen(false);
              }}
              className={styles.closeButton}
            >
              <CloseIcon />
            </button>
            <div className={styles.header}>
              <span className={styles.title}>Leaderboard</span>
              <button
                onClick={() => setInstructionOpen(true)}
                className={styles.infoButton}
              >
                <InfoIcon />
              </button>
            </div>

            <div className={styles.badge}>
              <span>Your Points:</span>&nbsp;
              <span>{currentUserPoints || 0}</span>
            </div>

            {referralLink && (
              <div
                onClick={() => {
                  void copy();
                }}
              >
                <div className={styles.linkTitle}>
                  <ChainIcon /> Referral Link
                </div>
                <div className={styles.linkCopy}>
                  {referralLink}
                  <button>{copied ? <TickIcon /> : <CopyIcon />}</button>
                </div>
              </div>
            )}

            {leaderboard.length > 0 && (
              <div className={styles.table}>
                <div className={styles.tableHeader}>
                  <span>#</span>
                  <span>Wallet</span>
                  <span>Points</span>
                </div>

                {leaderboard.map((row, index) => {
                  return (
                    <div
                      className={clsx(
                        styles.row,
                        row.isCurrentUser ? styles.activeRow : ""
                      )}
                      key={index}
                    >
                      <span>{row.position}</span>
                      <span>{row.wallet}</span>
                      <span>{row.points}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {instructionOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setInstructionOpen(false);
            }
          }}
          className={styles.leaderboardModalWrapper}
        >
          <div className={styles.leaderboardModalContainer}>
            <button
              onClick={() => {
                setInstructionOpen(false);
              }}
              className={styles.closeButton}
            >
              <CloseIcon />
            </button>

            <div className={styles.header}>
              <span className={styles.title}>Use Vironect and Get Points</span>
            </div>

            <p className={styles.description}>
              We have launched a campaign for early adopters who use Vironect,
              create and participate in audio/video meetings.
            </p>

            <div className={styles.block}>
              <div className={styles.blockHeader}>Point Earning Rules:</div>

              <div className={styles.blockBody}>
                <div className={styles.blockRow}>
                  <span className={styles.blockBadge}>Host</span>
                  <div className={styles.rewardBlockWrapper}>
                    <div className={styles.rewardBlock}>
                      <div>
                        <span>
                          {BASE_REWARDS_PER_MINUTE * ADMIN_POINTS_MULTIPLIER}{" "}
                          points
                        </span>
                        /min.
                      </div>
                      <span>as a host</span>
                    </div>
                    <div className={styles.plusIcon}>
                      <PlusIcon />
                    </div>
                    <div className={styles.rewardBlock}>
                      <div>
                        <span>{BASE_REWARDS_PER_MINUTE} point</span>/min.
                      </div>
                      <span>for each invited participant</span>
                    </div>
                  </div>
                </div>

                <div className={styles.blockRow}>
                  <span className={styles.blockBadge}>Participant</span>
                  <div className={styles.rewardBlock}>
                    <div>
                      <span>{BASE_REWARDS_PER_MINUTE} point</span>/min.
                    </div>
                    <span>as a participant</span>
                  </div>
                </div>

                <div className={styles.blockRow}>
                  <span className={styles.blockBadge}>Referral</span>
                  <div className={styles.rewardBlock}>
                    <div>
                      <span>{REFERRAL_REWARD_PERCENTAGE}%</span> of the points
                    </div>
                    <span>earned by the invited participant</span>
                  </div>
                </div>
              </div>
            </div>

            <p
              style={{
                marginBottom: "16px",
              }}
            >
              Points will be exchanged for the utility token $DTEL.
            </p>

            <p>
              We will 💎 reward the active campaign participants for their
              commitment to the Vironect.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
