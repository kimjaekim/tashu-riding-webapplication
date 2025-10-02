package com.future.my.common.web;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.multipart.MultipartFile;

@Controller
public class FileController {
	
	@Value("#{util['file.upload.path']}")
	private String CURR_IMAGE_PATH;

	@Value("#{util['file.download.path']}")
	private String WEB_PATH;
	
	@RequestMapping("/download")
	public void download(String imageFileName, HttpServletResponse resp) throws IOException {
		System.out.println(CURR_IMAGE_PATH);
		System.out.println(WEB_PATH);
		OutputStream out = resp.getOutputStream();
		String downloadFile = CURR_IMAGE_PATH + "\\" + imageFileName;
		File file = new File(downloadFile);
		if(!file.exists()) {
			resp.sendError(HttpServletResponse.SC_NOT_FOUND, "file not found");
		}
		// 서버에서 요청 파일을 찾아서 전달 (실시간 전송)
		resp.setHeader("Cache-Control", "no-cache");
		resp.setHeader("Content-Disposition","attachement; fileName=" + imageFileName);
		try(FileInputStream in = new FileInputStream(file)){
			byte [] buffer = new byte[1024 * 8];
			while(true) {
				int count = in.read(buffer);
				if(count == -1) {
					break;
				}
				out.write(buffer, 0, count); //실시간 전송 
			}
 		}catch(IOException e) {
			e.printStackTrace();
		}finally {
			out.close();
		}
	}
	@RequestMapping("/multiImgUpload")
	public void multiImgUpload(HttpServletRequest req, HttpServletResponse res) {
		try {
			// 저장 후 이미지 저장 정보 전달 
			String sFileInfo = "";
			String fileName = req.getHeader("file-name");
			String prifix = fileName.substring(fileName.lastIndexOf(".") + 1);
			prifix = prifix.toLowerCase();
			// 저장될 이름
			String realName = UUID.randomUUID().toString().replace("-", "")+"."+prifix;
			InputStream is = req.getInputStream();
			OutputStream os = new FileOutputStream(new File(CURR_IMAGE_PATH+"\\"+realName));
			int read = 0;
			byte b[] = new byte[1024];
			while((read = is.read(b)) != -1) {
				os.write(b, 0, read);
			}
			if(is != null) {
				is.close();
			}
			os.flush();
			os.close();
			// smart edit 규칙
			sFileInfo +="&bNewLine=true";
			sFileInfo +="&sFileName=" +fileName;
			sFileInfo +="&sFileURL=" + WEB_PATH + realName;
			PrintWriter print = res.getWriter();
			print.print(sFileInfo);
			print.flush();
			print.close();
			
		}catch (Exception e) {
			e.printStackTrace();
		}
	}
	@PostMapping("/uploadChatImage")
	@ResponseBody
	public Map<String, String> uploadChatImage(MultipartFile file) throws IllegalStateException, IOException{
		Map<String, String> result =new HashMap<>();
		if(file != null && !file.isEmpty()) {
			String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
			File f = new File(CURR_IMAGE_PATH, fileName);
			file.transferTo(f);
			result.put("imagePath", WEB_PATH+fileName);
		}
		return result;
	}
	
	
	
}
