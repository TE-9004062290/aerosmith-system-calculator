#!/bin/sh
#	
#	creator:		S.Sugawara
#	created:		2023-06-02
#	modified:		R.Maki 2023-06-16 アプリバージョンとOSSライセンスのjsonファイルを生成する処理を追加
#	description:	Build script
#	

###################################
##	Pre check
###################################

if [ ! -d "./src" ]; then
    echo "Calling from wrong directory. This script need to be called from repo root."
    exit 1
fi

if [ ! -e "./version.txt" ] || [ ! -e "./LICENSES.txt" ]; then
	echo "version.txt or LICENSES.txt does not exist."
    exit 1
fi

###################################
##	Version handling
###################################

readonly REPO_DMV="https://bitbucket.org/aerosmith-system-calculator/asc_manage-version.git"
readonly TARGET_BRANCH="develop"
readonly FOLDER_AMV="asc_manage-version"
readonly FILE_REV_TXT="revision.txt"
readonly FILE_VER_TXT="version.txt"


### 前準備
if [ -d $FOLDER_AMV ]; then
	rm -rf $FOLDER_AMV
fi

APP_VERSION=$1

### バージョン指定引数なし
# x.x.x.yyyyy
# x.x.x : from version.txt
# yyyyy : created by revision management system
if ! [ "$APP_VERSION" ]; then
    
	# ### バージョン管理リポジトリ取得
	git clone $REPO_DMV -b $TARGET_BRANCH

	cd ./$FOLDER_AMV

	### カレントリビジョン取得
	REV_COUNT=""
	read REV_COUNT < $FILE_REV_TXT

	### リビジョン更新
	REV_COUNT=`echo ${REV_COUNT} | sed -e "s/[\r\n]\+//g"`
	REV_COUNT=$((REV_COUNT+1))
	echo $REV_COUNT > $FILE_REV_TXT

	### 更新後リビジョンcommit&push
	GIT_USER_NAME=`git config user.name`
	COMMIT_MSG="Updated by "$GIT_USER_NAME" on "`date "+%Y/%m/%d %H:%M:%S"`
	git commit -a -m "$COMMIT_MSG"
	git push -f origin $TARGET_BRANCH

	cd ..
	rm -rf $FOLDER_AMV

	# ### 基準バージョン取得
	read APP_VERSION < $FILE_VER_TXT

	APP_VERSION=`echo ${APP_VERSION} | sed -e "s/[\r\n]\+//g"`

	###version.txtより取得されたフォーマットにより処理分岐
	# dotの数"x.x.x" or "x.x.x.xxxxx"により判断
	DOT_COUNT=`echo "$APP_VERSION" | sed -e 's@[^.]@@g' `
	DOT_COUNT=${#DOT_COUNT}

	if [ "$DOT_COUNT" == "2" ]; then
		APP_VERSION="$APP_VERSION""."
	elif [ "$DOT_COUNT" == "3" ]; then
		APP_VER_STR_COUNT=${#APP_VERSION}
		APP_VERSION=`echo $APP_VERSION | cut -c 1-$((APP_VER_STR_COUNT-5))`
	else
		echo "failed : invalid version parameter."
		exit 1
	fi

	REV_COUNT=`printf %05d ${REV_COUNT}`
	APP_VERSION="$APP_VERSION""$REV_COUNT"
fi

JSON_DATA='{\n\t"version": "'$APP_VERSION'"\n}'
FILE_VER_JSON="./src/app/config/version.json"

#アプリバージョンのjson形式のファイルを作成
echo -e $JSON_DATA > $FILE_VER_JSON


FILE_LICENSES_TXT="LICENSES.txt"
FILE_LICENSES_JSON="./src/app/config/LICENSES.json"
JSON_BEGIN_PARTS='{\n\t"content": "'
JSON_END_PARTS='"\n}'

#OSSライセンスのjson形式のファイルを作成
echo -en $JSON_BEGIN_PARTS > $FILE_LICENSES_JSON
sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\t/\\t/g' -ze 's/\n/\\n/g' -e 's/^\xEF\xBB\xBF//' $FILE_LICENSES_TXT >> $FILE_LICENSES_JSON
echo -e $JSON_END_PARTS >> $FILE_LICENSES_JSON


## 入力のみで使用するためコメントアウト
#echo $APP_VERSION > $FILE_VER_TXT

echo ""
echo "### Build version ###"
echo $APP_VERSION
echo "#####################"
echo ""

echo "Build in progress"
npm run build