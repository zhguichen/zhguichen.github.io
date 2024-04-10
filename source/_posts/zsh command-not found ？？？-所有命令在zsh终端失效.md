---
title: zsh command not found  ？？？ 所有命令在zsh终端失效.md
date: 2023-08-30 00:00:16
tags: Mac
---

# zsh: command not found ？？？ 所有命令在zsh终端失效解决方案

首先利用一下两行命令恢复vim等的操作

1. PATH=/bin:/usr/bin:/usr/local/bin:${PATH}

2. export PATH

3. open .bash_profile

4. 下面内容复制到.bash_profile  文件 

​    	PATH=/bin:/usr/bin:/usr/local/bin:${PATH}
​     	export PATH

5. source .bash_profile

6. 如果不行直接修改~/.zshrc

​		vim ~/.zshrc

​		PATH=/bin:/usr/bin:/usr/local/bin:${PATH}  export PATH 
