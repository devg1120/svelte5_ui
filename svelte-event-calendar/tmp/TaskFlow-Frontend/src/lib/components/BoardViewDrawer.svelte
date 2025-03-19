<script lang="ts">
  import { user_info_store } from "$lib/stores/user_store";
  import BoardSettingsModal from "$lib/components/BoardSettingsModal.svelte";
  import MemberModeration from "$lib/components/MemberModeration.svelte";
  import type { BoardContent } from "$lib/interfaces/board";
  import { sineIn } from "svelte/easing";
  import { fade } from "svelte/transition";
  import {
    Drawer,
    Sidebar,
    SidebarDropdownWrapper,
    SidebarGroup,
    SidebarItem,
    SidebarWrapper,
  } from "flowbite-svelte";
  import {
    PieChartSolid,
    UsersSolid,
    AnnotationSolid,
    ClipboardCheckSolid,
    AngleLeftSolid,
    AngleRightSolid,
    FileCodeSolid,
  } from "flowbite-svelte-icons";

  export let hiddenSideBar: boolean = true;
  export let board: BoardContent;

  function handleBoardUpdate(event: any) {
    board = {
      ...board,
      board_name: event.detail.board_name,
      board_deadline: event.detail.due_timestamp,
      board_description: event.detail.description,
    };
  }

  function handleMemberUpdate(event: any) {
    let userID = event.detail.user_id;
    let prev_role = event.detail.prev_role;
    let new_role = event.detail.new_role;
    let username = event.detail.username;
    let full_name = event.detail.full_name;
    let dp_url = event.detail.dp_url;
    if (new_role == -1) {
      // remove this user
      board.board_members = board.board_members.filter(
        (member) => member.user_id !== userID
      );
    } else if (prev_role == -1) {
      board.board_members = [
        ...board.board_members,
        {
          user_id: userID,
          username: username,
          full_name: full_name,
          role: new_role,
          dp_url: dp_url,
        },
      ];
    } else {
      board.board_members = board.board_members.map((member) => {
        if (member.user_id === userID) {
          member.role = new_role;
        }
        return member;
      });
    }
  }

  function toggleSidebar() {
    hiddenSideBar = !hiddenSideBar;
  }

  let boardSettingsModal: boolean = false;
  let memberModerationModal: boolean = false;
  let transitionParams = {
    x: -320,
    duration: 200,
    easing: sineIn,
  };
</script>

<button
  on:click={toggleSidebar}
  class="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100"
>
  <AngleRightSolid />
</button>
<Drawer
  transitionType="fly"
  {transitionParams}
  bind:hidden={hiddenSideBar}
  id="sidebar2"
  backdrop={false}
  leftOffset="top-16 h-screen start-0"
  divClass="bg-gray-100 dark:bg-accent-800 shadow-lg dark:shadow-none"
  width="w-72"
>
  <div class="flex items-center justify-between px-3">
    <h5
      id="drawer-navigation-label-3"
      class="text-base font-semibold text-gray-500 uppercase dark:text-gray-400"
    >
      Hello, {$user_info_store.username}
    </h5>
    <button
      on:click={toggleSidebar}
      class="flex items-center justify-center w-12 h-12 rounded-full hover:bg-gray-100"
    >
      <AngleLeftSolid />
    </button>
  </div>
  <Sidebar>
    <SidebarWrapper
      divClass="overflow-y-auto py-4 px-3 rounded dark:bg-gray-800"
    >
      <SidebarGroup>
        {#if board?.board_access <= 2}
          <SidebarItem
            label="Board Settings"
            on:click={() => (boardSettingsModal = true)}
          >
            <svelte:fragment slot="icon">
              <PieChartSolid
                class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
              />
            </svelte:fragment>
          </SidebarItem>
        {/if}
        <SidebarItem
          label="Members"
          on:click={() => (memberModerationModal = true)}
        >
          <svelte:fragment slot="icon">
            <UsersSolid
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem>

        <!-- <SidebarDropdownWrapper label="Recent Boards">
          <svelte:fragment slot="icon">
            <AnnotationSolid
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment> -->
        <!-- this can be later added from database -->
        <!-- {#each recent_board_ids as id}
                <SidebarDropdownItem
                  label="Board {id}"
                  target="_self"
                  href={`/boards/${id}`}
                />
              {/each} -->
        <!-- </SidebarDropdownWrapper>
        <SidebarDropdownWrapper label="Your Boards">
          <svelte:fragment slot="icon">
            <ClipboardCheckSolid
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarDropdownWrapper> -->

        <!-- <SidebarItem label="Log out">
          <svelte:fragment slot="icon">
            <FileCodeSolid
              class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
            />
          </svelte:fragment>
        </SidebarItem> -->
      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</Drawer>

{#if boardSettingsModal}
  <div transition:fade={{ duration: 250 }}>
    <BoardSettingsModal
      bind:board
      bind:showModal={boardSettingsModal}
      on:boardUpdated={handleBoardUpdate}
    />
  </div>
{/if}

{#if memberModerationModal}
  <div transition:fade={{ duration: 250 }}>
    <MemberModeration
      bind:showModal={memberModerationModal}
      on:memberUpdated={handleMemberUpdate}
      bind:board
    />
  </div>
{/if}
