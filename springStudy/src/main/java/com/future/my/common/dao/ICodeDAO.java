package com.future.my.common.dao;

import java.util.ArrayList;

import org.apache.ibatis.annotations.Mapper;

import com.future.my.common.vo.CodeVO;
import com.future.my.common.vo.QuestionVO;
import com.future.my.common.vo.StoreVO;

@Mapper 
public interface ICodeDAO {
	
	public ArrayList<CodeVO> getCodeList (String commParent);
	
	public ArrayList<QuestionVO> getSurvey();
	
	public ArrayList<StoreVO> getStoreList();
	
}
