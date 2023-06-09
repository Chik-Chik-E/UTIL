package com.youtil.server.service.tag;

import com.youtil.server.common.PagedResponse;
import com.youtil.server.common.exception.ResourceNotFoundException;
import com.youtil.server.domain.post.Post;
import com.youtil.server.domain.tag.Tag;
import com.youtil.server.domain.tag.TagOfPost;
import com.youtil.server.domain.user.User;
import com.youtil.server.domain.user.UserOfTag;
import com.youtil.server.dto.post.PostResponse;
import com.youtil.server.dto.tag.TagResponse;
import com.youtil.server.dto.tag.TagSaveRequest;
import com.youtil.server.dto.tag.TagUpdateRequest;
import com.youtil.server.dto.user.UserResponse;
import com.youtil.server.repository.post.PostRepository;
import com.youtil.server.repository.tag.TagOfPostRepository;
import com.youtil.server.repository.tag.TagQueryRepository;
import com.youtil.server.repository.tag.TagRepository;
import com.youtil.server.repository.tag.UserOfTagRepository;
import com.youtil.server.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TagService {
    final UserOfTagRepository userOfTagRepository;
    final TagRepository tagRepository;
    final UserRepository userRepository;
    final PostRepository postRepository;
    final TagOfPostRepository tagOfPostRepository;
    final TagQueryRepository tagQueryRepository;

    // 관심 테그
    @Transactional
    public List<Long> findOrCrateTagLike(Long userId, TagSaveRequest request) { // 관심 테그 추가
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        List<Long> list = new ArrayList<>();
        for(String tag : request.getSkill()){
            tag = tag.toLowerCase().replace(" ", "");
            Tag findTags = tagRepository.findByTagName(tag);

            if(findTags == null){
                findTags = tagRepository.save(request.of(tag));
            }
            if(userOfTagRepository.findUserAndTag(user, findTags).isEmpty()){
                UserOfTag userOfTag = new UserOfTag(user, findTags);
                list.add(userOfTagRepository.save(userOfTag).getUserOfTagId());
            }

        }
        return list;    // UserOfTagId 리스트 리턴
    }
    public List<TagResponse> getTagLike(Long userId) { // 관심 테그 조회
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        return userOfTagRepository.findByUser(user)
                .stream().map(TagResponse::new).collect(Collectors.toList());
    }

    //유저별 관심 태그 조회
    public Object getUserTagLike(Long specUserId) { //유져별 관심 태그 조회
        User user = userRepository.findById(specUserId).orElseThrow(() -> new ResourceNotFoundException("User", "userId", specUserId));
        return userOfTagRepository.findBySpecUser(user)
                .stream().map(TagResponse::new).collect(Collectors.toList());
    }

    @Transactional
    public Long updateTagLike(Long userId, TagSaveRequest request) {
        deleteTagLike(userId);
        findOrCrateTagLike(userId, request);
        return userId;
    }
    @Transactional
    public Long deleteTagLike(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        userOfTagRepository.deleteByUser(user);
        return user.getUserId();
    }
    // 게시글 태그
    @Transactional
    public List<Long> findOrCrateTagPost(Long postId, TagSaveRequest request) { // 포스트 테그 추가
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post", "postId", postId));
        List<Long> list = new ArrayList<>();
        for(String tag : request.getSkill()){
            tag = tag.toLowerCase().replace(" ", "");
            Tag findTags = tagRepository.findByTagName(tag);

            if(findTags == null){
                findTags = tagRepository.save(request.of(tag));
            }
            if(tagOfPostRepository.findByPostAndTag(post, findTags).isEmpty()){
                TagOfPost tagOfPost = new TagOfPost(post, findTags);
                list.add(tagOfPostRepository.save(tagOfPost).getTagOfPostId());
            }
        }
        return list;    // UserOfTagId 리스트 리턴
    }
    public List<TagResponse> getTagByPost(Long postId) { // 포스트로 테그 조회
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post", "postId", postId));
        return tagOfPostRepository.findByPost(post)
                .stream().map(TagResponse::new).collect(Collectors.toList());
    }
    @Transactional
    public Long updateTagPost(Long postId, TagSaveRequest request) {
        deleteTagPost(postId);
        findOrCrateTagPost(postId, request);
        return postId;
    }
    public List<TagResponse> getPostbyTag(Long tagId) { // 테그로 포스트 조회
        Tag tag = tagRepository.findById(tagId).orElseThrow(() -> new ResourceNotFoundException("Tag", "tagId", tagId));
        return tagOfPostRepository.findByTag(tag)
                .stream().map(TagResponse::new).collect(Collectors.toList());
    }
    @Transactional
    public Long deleteTagPost(Long postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new ResourceNotFoundException("Post", "postId", postId));
        tagOfPostRepository.deleteByPost(post);
        return postId;
    }

    // 전체 태그
    public List<TagResponse> getTag() { // 전체 테그 조회
        return tagRepository.findAll()
                .stream().map(TagResponse::new).collect(Collectors.toList());
    }
    @Transactional
    public Long deleteTag(Long tagId) {
        Tag tag = tagRepository.findById(tagId).orElseThrow(() -> new ResourceNotFoundException("Tag", "tagId", tagId));
        tagRepository.deleteByTagId(tagId);
        return tagId;
    }

    @Transactional
    public Long updateTag(Long tagId, TagUpdateRequest request) {
        Tag tag = tagRepository.findById(tagId).orElseThrow(() -> new ResourceNotFoundException("Tag", "tagId", tagId));
        tag.update(request.getTagName());
        return tag.getTagId();
    }

    //태그별 게시물 조회
    public PagedResponse<PostResponse> findPostListByTag(Long userId, Long tagId, String criteria, int offset, int size) { // 테그로 포스트 조회
        Tag tag = tagRepository.findById(tagId).orElseThrow(() -> new ResourceNotFoundException("Tag", "tagId", tagId));
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        Page<Post> page =tagQueryRepository.findPostListByTag(userId, tagId, criteria, PageRequest.of(offset-1, size));
        List<PostResponse> responses = page.stream().map((post)-> new PostResponse(post, user, getTagByPost(post.getPostId()))).collect(Collectors.toList());
        return new PagedResponse<>(responses, page.getNumber()+1, page.getSize(), page.getTotalElements(),
                page.getTotalPages(), page.isLast());

    }
    public PagedResponse<PostResponse> findPostListByTagName(Long userId, String tagName, String criteria, int offset, int size) { // 테그로 포스트 조회
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        Page<Post> page =tagQueryRepository.findPostListByTagName(userId, tagName, criteria, PageRequest.of(offset-1, size));
        List<PostResponse> responses = page.stream().map((post)-> new PostResponse(post, user, getTagByPost(post.getPostId()))).collect(Collectors.toList());
        return new PagedResponse<>(responses, page.getNumber()+1, page.getSize(), page.getTotalElements(),
                page.getTotalPages(), page.isLast());

    }
    //나의 관심 태그별 게시글 조회
    public PagedResponse<PostResponse> findPostListByMyTag(Long userId, String criteria, int offset, int size) { // 나의 관심 테그로 포스트 조회
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));

        Page<Post> page = tagQueryRepository.findPostListByMyTag(userId, criteria, PageRequest.of(offset-1, size));
        List<PostResponse> responses = page.stream().map((post)-> new PostResponse(post, user, getTagByPost(post.getPostId()))).collect(Collectors.toList());
        return new PagedResponse<>(responses, page.getNumber()+1, page.getSize(), page.getTotalElements(),
                page.getTotalPages(), page.isLast());
    }

    public PagedResponse<UserResponse> findUserListByMyTag(Long userId, int offset, int size) { // 나의 관심 테그로 유저리스트 조회
        User user = userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User", "userId", userId));
        Page<User> page = tagQueryRepository.findUserListByMyTag(userId, PageRequest.of(offset-1, size));
        List<UserResponse> responses = page.stream().map((u)-> UserResponse.from(u, getTagLike(u.getUserId()))).collect(Collectors.toList());
        return new PagedResponse<>(responses, page.getNumber()+1, page.getSize(), page.getTotalElements(),
                page.getTotalPages(), page.isLast());
    }

}
