import React, { useMemo } from 'react';

import { getStrippedEmojiData } from '../Channel/emojiData';

import {
  EmojiSetDef,
  MinimalEmoji,
  useChannelStateContext,
} from '../../context/ChannelStateContext';
import { useComponentContext } from '../../context/ComponentContext';
import { useMessageContext } from '../../context/MessageContext';

import type { ReactionResponse } from 'stream-chat';

import type { ReactEventHandler } from '../Message/types';

import type {
  DefaultAttachmentType,
  DefaultChannelType,
  DefaultCommandType,
  DefaultEventType,
  DefaultMessageType,
  DefaultReactionType,
  DefaultUserType,
} from '../../../types/types';

export type ReactionsListProps<
  Re extends DefaultReactionType = DefaultReactionType,
  Us extends DefaultUserType<Us> = DefaultUserType
> = {
  emojiSetDef?: EmojiSetDef;
  onClick?: ReactEventHandler;
  own_reactions?: ReactionResponse<Re, Us>[] | null;
  /** Object/map of reaction id/type (e.g. 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') vs count */
  reaction_counts?: { [key: string]: number };
  /** Provide a list of reaction options [{id: 'angry', emoji: 'angry'}] */
  reactionOptions?: MinimalEmoji[];
  reactions?: ReactionResponse<Re, Us>[];
  reverse?: boolean;
};

const UnMemoizedReactionsList = <
  At extends DefaultAttachmentType = DefaultAttachmentType,
  Ch extends DefaultChannelType = DefaultChannelType,
  Co extends DefaultCommandType = DefaultCommandType,
  Ev extends DefaultEventType = DefaultEventType,
  Me extends DefaultMessageType = DefaultMessageType,
  Re extends DefaultReactionType = DefaultReactionType,
  Us extends DefaultUserType<Us> = DefaultUserType
>(
  props: ReactionsListProps<Re, Us>,
) => {
  const {
    onClick,
    reaction_counts,
    reactionOptions: reactionOptionsProp,
    reactions,
    reverse = false,
  } = props;

  const { emojiConfig } = useChannelStateContext<At, Ch, Co, Ev, Me, Re, Us>();
  const { Emoji } = useComponentContext<At, Ch, Co, Ev, Me, Re, Us>();
  const { onReactionListClick } = useMessageContext<At, Ch, Co, Ev, Me, Re, Us>();

  const { defaultMinimalEmojis, emojiData: fullEmojiData, emojiSetDef } = emojiConfig || {};

  const emojiData = useMemo(() => getStrippedEmojiData(fullEmojiData), [fullEmojiData]);

  const reactionOptions = reactionOptionsProp || defaultMinimalEmojis || [];

  const getTotalReactionCount = () =>
    Object.values(reaction_counts || {}).reduce((total, count) => total + count, 0);

  const getOptionForType = (type: string) => reactionOptions.find((option) => option.id === type);

  const getReactionTypes = () => {
    if (!reactions) return [];
    const allTypes = new Set(reactions.map(({ type }) => type));

    return Array.from(allTypes);
  };

  return (
    <div
      className={`str-chat__reaction-list ${reverse ? 'str-chat__reaction-list--reverse' : ''}`}
      data-testid='reaction-list'
      onClick={onClick || onReactionListClick}
    >
      <ul>
        {getReactionTypes().map((reactionType) => {
          const emojiDefinition = getOptionForType(reactionType);
          return emojiDefinition ? (
            <li key={emojiDefinition.id}>
              {Emoji && (
                <Emoji
                  // @ts-expect-error
                  emoji={emojiDefinition}
                  {...emojiSetDef}
                  // @ts-expect-error
                  data={emojiData}
                  size={16}
                />
              )}
              &nbsp;
            </li>
          ) : null;
        })}
        <li>
          <span className='str-chat__reaction-list--counter'>{getTotalReactionCount()}</span>
        </li>
      </ul>
    </div>
  );
};

export const ReactionsList = React.memo(UnMemoizedReactionsList) as typeof UnMemoizedReactionsList;
