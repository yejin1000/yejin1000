document.addEventListener('DOMContentLoaded', function() {
  const commentForm = document.getElementById('comment-form');
  const commentInput = document.getElementById('comment-input');
  const userIdInput = document.getElementById('user-id-input');
  const userPasswordInput = document.getElementById('user-password-input');
  const commentsList = document.getElementById('comments-list');
  const commentModal = document.getElementById('comment-modal');
  const passwordInput = document.getElementById('password-input');
  const editButton = document.getElementById('edit-button');
  const deleteButton = document.getElementById('delete-button');
  let selectedComment = null;

  // 댓글을 로드하는 함수
  function loadComments() {
    const storedComments = localStorage.getItem(getStorageKey()); // 각 환경에 대한 스토리지 키 사용
    if (storedComments) {
      commentsList.innerHTML = storedComments;
    }
  }

  // 페이지 로드 시 댓글 로드
  loadComments();

  // 댓글 작성 이벤트
  commentForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the default form submission

    const userId = userIdInput.value.trim(); // Get the trimmed user ID
    const userPassword = userPasswordInput.value.trim(); // Get the trimmed user password
    const commentText = commentInput.value.trim(); // Get the trimmed comment text

    if (commentText !== '') { // Check if the comment is not empty
      addComment(userId, userPassword, commentText); // Add the comment to the list
      commentInput.value = ''; // Clear the input field after adding the comment
      userIdInput.value = ''; // Clear the user ID field after adding the comment
      userPasswordInput.value = ''; // Clear the user password field after adding the comment
      saveComments(); // Save the comments to local storage
    }
  });

  // 댓글 수정/삭제 모달 닫기
  document.getElementsByClassName("close")[0].onclick = function() {
    commentModal.style.display = "none";
  };

  // 댓글 클릭 이벤트
  commentsList.addEventListener('click', function(event) {
    const comment = event.target.closest('.comment');
    if (comment) {
      selectedComment = comment;
      commentModal.style.display = "block";
    }
  });

  // 수정 버튼 클릭 이벤트
  editButton.addEventListener('click', function() {
    const password = passwordInput.value.trim();
    if (password === selectedComment.dataset.password) {
      const newCommentText = prompt('수정할 댓글 내용을 입력하세요:', selectedComment.textContent.trim());
      if (newCommentText !== null) {
        selectedComment.textContent = newCommentText;
        saveComments();
        commentModal.style.display = "none";
      }
    } else {
      alert('The passwords you provided do not match.');
    }
  });


  // 댓글을 로컬 스토리지에 저장하는 함수
  function saveComments() {
    localStorage.setItem(getStorageKey(), commentsList.innerHTML); // 각 환경에 대한 스토리지 키 사용
  }
  // Mastercode 설정 (임의의 값으로 설정)
  const mastercode = "master";

    // 댓글을 추가하는 함수
  function addComment(userId, userPassword, commentText) {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.textContent = `${userId}: ${commentText}`;
    // 'data-user-password' 속성을 추가하여 사용자가 입력한 비밀번호를 저장
    commentElement.setAttribute('data-user-password', userPassword);
    // 'data-password' 속성을 추가하고 내용을 숨김
    commentElement.setAttribute('data-password', 'default');
    hideDataPassword(commentElement);
    commentsList.appendChild(commentElement);
  }

  // 삭제 버튼 클릭 이벤트
  deleteButton.addEventListener('click', function() {
    const password = passwordInput.value.trim();
    const commentPassword = selectedComment.getAttribute('data-password'); // 선택된 댓글의 비밀번호 가져오기
    const userPassword = selectedComment.getAttribute('data-user-password'); // 선택된 댓글의 사용자가 입력한 비밀번호 가져오기
    const masterCode = 'master'; // mastercode 설정

    // 사용자가 입력한 비밀번호, 사용자가 입력한 비밀번호, mastercode가 일치하는지 확인
    if (password === commentPassword || password === userPassword || password === masterCode) {
      selectedComment.remove();
      saveComments();
      commentModal.style.display = "none";
    } else {
      alert('The passwords you provided do not match.');
    }
  });

  // 수정 버튼 클릭 이벤트
  editButton.addEventListener('click', function() {
    const password = passwordInput.value.trim();
    const commentPassword = selectedComment.getAttribute('data-password'); // 선택된 댓글의 비밀번호 가져오기
    const userPassword = selectedComment.getAttribute('data-user-password'); // 선택된 댓글의 사용자가 입력한 비밀번호 가져오기
    const masterCode = 'master'; // mastercode 설정

    // 사용자가 입력한 비밀번호, 사용자가 입력한 비밀번호, mastercode가 일치하는지 확인
    if (password === commentPassword || password === userPassword || password === masterCode) {
      const newCommentText = prompt('Edited Your Comments here', selectedComment.textContent.trim());
      if (newCommentText !== null) {
        selectedComment.textContent = newCommentText;
        saveComments();
        commentModal.style.display = "none";
      }
    } else {
      alert('The passwords you provided do not match.');
    }
  });


  // 'data-password' 속성을 숨기는 함수
  function hideDataPassword(commentElement) {
    // 비밀번호를 숨기는 것이 아니라 비밀번호를 'hidden'으로 설정합니다.
    commentElement.dataset.password = 'Default';
  }


  // 각 환경에 대한 스토리지 키 생성하는 함수
  function getStorageKey() {
    // 각 환경에 대한 식별자를 가져와서 이를 기반으로 스토리지 키를 생성합니다.
    const environmentIdentifier = getEnvironmentIdentifier(); // 환경에 대한 식별자 가져오기
    return `comments_${environmentIdentifier}`; // 스토리지 키 생성
  }

  // 환경에 대한 식별자를 가져오는 함수 (예: A환경, B환경)
  function getEnvironmentIdentifier() {
    // 예를 들어, 현재 도메인 이름을 기반으로 식별자를 결정할 수 있습니다.
    const domain = window.location.hostname;
    if (domain.includes('exampleA.com')) {
      return 'A'; // A환경의 식별자
    } else if (domain.includes('exampleB.com')) {
      return 'B'; // B환경의 식별자
    } else {
      return 'unknown'; // 다른 환경의 식별자
    }
  }

});
