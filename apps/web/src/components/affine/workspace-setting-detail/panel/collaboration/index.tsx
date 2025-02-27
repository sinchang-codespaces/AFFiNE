import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  toast,
  Wrapper,
} from '@affine/component';
import { PermissionType } from '@affine/datacenter';
import { useTranslation } from '@affine/i18n';
import {
  DeleteTemporarilyIcon,
  EmailIcon,
  MoreVerticalIcon,
} from '@blocksuite/icons';
import React, { useCallback, useState } from 'react';

import { lockMutex } from '../../../../../atoms';
import { useMembers } from '../../../../../hooks/affine/use-members';
import { transformWorkspace } from '../../../../../plugins';
import {
  AffineRemoteWorkspace,
  LocalWorkspace,
  RemWorkspaceFlavour,
} from '../../../../../shared';
import { Unreachable } from '../../../affine-error-eoundary';
import { TransformWorkspaceToAffineModal } from '../../../transform-workspace-to-affine-modal';
import { PanelProps } from '../../index';
import { InviteMemberModal } from './invite-member-modal';
import {
  StyledMemberAvatar,
  StyledMemberButtonContainer,
  StyledMemberContainer,
  StyledMemberEmail,
  StyledMemberInfo,
  StyledMemberListContainer,
  StyledMemberListItem,
  StyledMemberName,
  StyledMemberNameContainer,
  StyledMemberRoleContainer,
  StyledMemberTitleContainer,
  StyledMoreVerticalButton,
  StyledMoreVerticalDiv,
} from './style';

const AffineRemoteCollaborationPanel: React.FC<
  Omit<PanelProps, 'workspace'> & {
    workspace: AffineRemoteWorkspace;
  }
> = ({ workspace }) => {
  const [isInviteModalShow, setIsInviteModalShow] = useState(false);
  const { t } = useTranslation();
  const { members, removeMember } = useMembers(workspace.id);
  return (
    <>
      <StyledMemberContainer>
        <ul>
          <StyledMemberTitleContainer>
            <StyledMemberNameContainer>
              {t('Users')} ({members.length})
            </StyledMemberNameContainer>
            <StyledMemberRoleContainer>
              {t('Access level')}
            </StyledMemberRoleContainer>
            <div style={{ width: '24px', paddingRight: '48px' }}></div>
          </StyledMemberTitleContainer>
        </ul>

        <StyledMemberListContainer>
          {members.length > 0 && (
            <>
              {members
                .sort((b, a) => a.type - b.type)
                .map((member, index) => {
                  const user = {
                    avatar_url: '',
                    id: '',
                    name: '',
                    ...member.user,
                  };
                  return (
                    <StyledMemberListItem key={index}>
                      <StyledMemberNameContainer>
                        <StyledMemberAvatar
                          alt="member avatar"
                          src={user.avatar_url}
                        >
                          <EmailIcon />
                        </StyledMemberAvatar>

                        <StyledMemberInfo>
                          <StyledMemberName>{user.name}</StyledMemberName>
                          <StyledMemberEmail>
                            {member.user.email}
                          </StyledMemberEmail>
                        </StyledMemberInfo>
                      </StyledMemberNameContainer>
                      <StyledMemberRoleContainer>
                        {member.accepted
                          ? member.type !== PermissionType.Owner
                            ? t('Member')
                            : t('Owner')
                          : t('Pending')}
                      </StyledMemberRoleContainer>
                      {member.type === PermissionType.Owner ? (
                        <StyledMoreVerticalDiv />
                      ) : (
                        <StyledMoreVerticalButton>
                          <Menu
                            content={
                              <>
                                <MenuItem
                                  onClick={async () => {
                                    // FIXME: remove ignore

                                    // @ts-ignore
                                    await removeMember(member.id);
                                    toast(
                                      t('Member has been removed', {
                                        name: user.name,
                                      })
                                    );
                                  }}
                                  icon={<DeleteTemporarilyIcon />}
                                >
                                  {t('Remove from workspace')}
                                </MenuItem>
                              </>
                            }
                            placement="bottom-end"
                            disablePortal={true}
                            trigger="click"
                          >
                            <IconButton>
                              <MoreVerticalIcon />
                            </IconButton>
                          </Menu>
                        </StyledMoreVerticalButton>
                      )}
                    </StyledMemberListItem>
                  );
                })}
            </>
          )}
        </StyledMemberListContainer>
        <StyledMemberButtonContainer>
          <Button
            onClick={() => {
              setIsInviteModalShow(true);
            }}
            type="primary"
            shape="circle"
          >
            {t('Invite Members')}
          </Button>
        </StyledMemberButtonContainer>
      </StyledMemberContainer>
      <InviteMemberModal
        onClose={useCallback(() => {
          setIsInviteModalShow(false);
        }, [])}
        onInviteSuccess={useCallback(() => {
          setIsInviteModalShow(false);
        }, [])}
        workspaceId={workspace.id}
        open={isInviteModalShow}
      />
    </>
  );
};

const LocalCollaborationPanel: React.FC<
  Omit<PanelProps, 'workspace'> & {
    workspace: LocalWorkspace;
  }
> = ({ workspace, onTransferWorkspace }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Wrapper marginBottom="32px">{t('Collaboration Description')}</Wrapper>
      <Button
        type="light"
        shape="circle"
        onClick={() => {
          setOpen(true);
        }}
      >
        {t('Enable AFFiNE Cloud')}
      </Button>
      <TransformWorkspaceToAffineModal
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        onConform={() => {
          // todo(himself65): move this function out of affine component
          lockMutex(async () => {
            const id = await transformWorkspace(
              RemWorkspaceFlavour.LOCAL,
              RemWorkspaceFlavour.AFFINE,
              workspace
            );
            onTransferWorkspace(id);
            setOpen(false);
          });
        }}
      />
    </>
  );
};

export const CollaborationPanel: React.FC<PanelProps> = props => {
  switch (props.workspace.flavour) {
    case RemWorkspaceFlavour.AFFINE: {
      const workspace = props.workspace as AffineRemoteWorkspace;
      return (
        <AffineRemoteCollaborationPanel {...props} workspace={workspace} />
      );
    }
    case RemWorkspaceFlavour.LOCAL: {
      const workspace = props.workspace as LocalWorkspace;
      return <LocalCollaborationPanel {...props} workspace={workspace} />;
    }
  }
  throw new Unreachable();
};
