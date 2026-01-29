package com.example.ebook.common;

import java.io.File;
import java.io.IOException;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
public class FileStore {
    
    @Value("${ebook.storage.path}")
    private String storagePath;

    //파일 저장 후 저장된 파일명 반환
    public String storeFile(MultipartFile file) throws IOException {
        if(file == null || file.isEmpty()) {
            return null;
        }

        //원본 파일명
        String originalFilename = file.getOriginalFilename();

        //서버에 저장할 파일명(UUID 사용해서 중복방지)
        String storeFilename = createStoreFileName(originalFilename);

        //저장 경로에 폴더가 없으면 생성
        File folder = new File(storagePath);
        if(!folder.exists()) {
            folder.mkdirs();
        }

        //실제 파일 저장(경로+파일명)
        file.transferTo(new File(folder.getAbsolutePath() + File.separator + storeFilename));
        return storeFilename;
    }

    // UUID 파일명 생성기
    private String createStoreFileName(String originalFileName) {
        String ext = extractExt(originalFileName);      //확장자 추출
        String uuid = UUID.randomUUID().toString();
        return uuid + "." + ext;
    }

    // 확장자 추출
    private String extractExt(String originalFileName) {
        int pos = originalFileName.lastIndexOf(".");
        if(pos == -1) return "";        //확장자 없음
        return originalFileName.substring(pos + 1);    
    }
}
